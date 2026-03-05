/**
 * Request Builder Module
 * Constructs HTTP request configurations from test definitions
 * 
 * Responsibilities:
 * - Build axios config from test definitions
 * - Substitute variables in URL, headers, body
 * - Apply authentication headers
 * - Handle REST and GraphQL requests differently
 * - Auto-detect and set Content-Type
 */

import { AxiosRequestConfig } from 'axios';
import { HttpRequest, TestCase, Variables, AuthConfig, Headers } from '../../types/index';
import { VariableResolver } from '../variables/resolver';
import { logger } from '../../utils/logger';

export class RequestBuilder {
  private resolver: VariableResolver;

  constructor(resolver: VariableResolver) {
    this.resolver = resolver;
  }

  /**
   * Build axios request config from test case
   */
  buildRestRequest(testCase: TestCase, variables: Variables): AxiosRequestConfig {
    const { request, auth, timeout } = testCase;

    // Substitute variables in URL
    const url = this.resolver.resolve(request.url);
    logger.debug(`[RequestBuilder] Building request to: ${url}`);

    // Build headers
    const headers = this.buildHeaders(request.headers);

    // Apply authentication
    if (auth) {
      this.applyAuth(headers, auth);
    }

    // Build body
    let data: any;
    if (request.body) {
      data = this.buildBody(request.body, headers);
    }

    // Construct axios config
    const config: AxiosRequestConfig = {
      method: request.method,
      url,
      headers,
      timeout: timeout || 30000,
      validateStatus: () => true, // Don't throw on any status
    };

    if (data !== undefined) {
      config.data = data;
    }

    return config;
  }

  /**
   * Build headers object with variable substitution
   */
  private buildHeaders(headerMap?: Headers): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'Zelte/0.1.0',
    };

    if (headerMap) {
      for (const [key, value] of Object.entries(headerMap)) {
        // Convert array values to string
        const headerValue = Array.isArray(value) ? value.join(',') : value;
        headers[key] = this.resolver.resolve(headerValue);
      }
    }

    return headers;
  }

  /**
   * Apply authentication to headers
   */
  private applyAuth(headers: Record<string, string>, auth: AuthConfig): void {
    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          const token = this.resolver.resolve(auth.token);
          headers['Authorization'] = `Bearer ${token}`;
        }
        break;

      case 'api-key':
        if (auth.header && auth.value) {
          const value = this.resolver.resolve(auth.value);
          headers[auth.header] = value;
        }
        break;

      case 'basic':
        if (auth.username && auth.password) {
          const username = this.resolver.resolve(auth.username);
          const password = this.resolver.resolve(auth.password);
          const credentials = Buffer.from(`${username}:${password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'inherit-from-env':
        if (auth.header && auth.value) {
          const value = this.resolver.resolve(auth.value);
          headers[auth.header] = value;
        }
        break;
    }

    logger.debug(`[RequestBuilder] Applied auth type: ${auth.type}`);
  }

  /**
   * Build request body with variable substitution
   */
  private buildBody(body: any, headers: Record<string, string>): any {
    if (typeof body === 'string') {
      return this.resolver.resolve(body);
    }

    if (typeof body === 'object' && body !== null) {
      // Deep substitute variables in object
      return this.deepResolve(body);
    }

    return body;
  }

  /**
   * Recursively resolve variables in nested objects
   */
  private deepResolve(obj: any): any {
    if (typeof obj === 'string') {
      return this.resolver.resolve(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepResolve(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const resolved: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.deepResolve(value);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * Build GraphQL request config
   */
  buildGraphQLRequest(
    endpoint: string,
    query: string,
    variables: Record<string, any> = {},
    auth?: AuthConfig,
    customVariables: Variables = {}
  ): AxiosRequestConfig {
    const url = this.resolver.resolve(endpoint);
    const headers = this.buildHeaders({});

    if (auth) {
      this.applyAuth(headers, auth);
    }

    // Set GraphQL content type
    headers['Content-Type'] = 'application/json';

    // Resolve variables in GraphQL query
    const resolvedQuery = this.resolver.resolve(query);
    const resolvedVariables = this.deepResolve(variables);

    const data = {
      query: resolvedQuery,
      variables: resolvedVariables,
    };

    return {
      method: 'POST',
      url,
      headers,
      data,
      validateStatus: () => true,
    };
  }
}
