/**
 * HTTP Client Module
 * Executes HTTP requests and captures responses
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpRequest, HttpResponse, AuthConfig } from '../../types/index';
import { logger } from '../../utils/logger';

export class HttpClient {
  private client: AxiosInstance;
  private timeout: number;

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
    this.client = axios.create({
      timeout,
      validateStatus: () => true, // Don't throw on any status code
    });

    // Add request/response interceptors
    this.client.interceptors.request.use((config) => {
      logger.debug(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use((response) => {
      logger.debug(`[HTTP] Response: ${response.status} (${response.headers['content-type'] || 'unknown'})`);
      return response;
    });
  }

  /**
   * Execute HTTP request
   */
  async execute(request: HttpRequest): Promise<HttpResponse> {
    const startTime = Date.now();

    try {
      // Build axios config
      const config = this.buildAxiosConfig(request);

      // Execute request
      const response = await this.client.request(config);

      // Calculate duration
      const duration = Date.now() - startTime;

      // Parse response data
      let data: any;
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        } catch (error) {
          logger.debug('Failed to parse JSON response');
          data = response.data;
        }
      }

      return {
        statusCode: response.status,
        headers: response.headers as Record<string, string | string[]>,
        body: this.bodyToString(response.data),
        data,
        duration,
        timestamp: Date.now(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (axios.isAxiosError(error)) {
        // Network error or timeout
        const statusCode = error.response?.status || 0;
        const body = this.bodyToString(error.response?.data || error.message);
        const headers = (error.response?.headers || {}) as Record<string, string | string[]>;

        return {
          statusCode,
          headers,
          body,
          duration,
          timestamp: Date.now(),
        };
      }

      // Other error (timeout, etc)
      throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build Axios request config from HttpRequest
   */
  private buildAxiosConfig(request: HttpRequest): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      method: request.method.toLowerCase() as any,
      url: request.url,
      timeout: request.timeout || this.timeout,
      headers: request.headers || {},
    };

    // Add body if present
    if (request.body !== undefined && request.body !== null) {
      config.data = request.body;
    }

    // Add authentication
    if (request.auth) {
      this.applyAuth(config, request.auth);
    }

    return config;
  }

  /**
   * Apply authentication to request
   */
  private applyAuth(config: AxiosRequestConfig, auth: AuthConfig): void {
    if (!config.headers) {
      config.headers = {};
    }

    const headers = config.headers as Record<string, string>;

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          headers['Authorization'] = `Bearer ${auth.token}`;
        }
        break;

      case 'basic':
        if (auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'api-key':
        if (auth.header && auth.value) {
          headers[auth.header] = auth.value;
        }
        break;

      case 'inherit-from-env':
        // This would be handled by variable substitution before reaching here
        break;
    }
  }

  /**
   * Convert response body to string
   */
  private bodyToString(body: any): string {
    if (body === null || body === undefined) {
      return '';
    }

    if (typeof body === 'string') {
      return body;
    }

    if (typeof body === 'object') {
      try {
        return JSON.stringify(body);
      } catch {
        return String(body);
      }
    }

    return String(body);
  }
}

export function createHttpClient(timeout?: number): HttpClient {
  return new HttpClient(timeout);
}
