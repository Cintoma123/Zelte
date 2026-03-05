/**
 * Response Parser Module
 * Parses and structures HTTP responses for assertion evaluation
 * 
 * Responsibilities:
 * - Parse response status, headers, body
 * - Detect content type and parse accordingly (JSON, XML, plain text)
 * - Calculate response time
 * - Provide structured data for assertions
 * - Extract JSON paths from response body
 */

import { AxiosResponse } from 'axios';
import { HttpResponse } from '../../types/index';
import { logger } from '../../utils/logger';

export class ResponseParser {
  /**
   * Parse axios response into structured HttpResponse
   */
  static parse(
    response: AxiosResponse,
    startTime: number
  ): HttpResponse {
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.debug(`[ResponseParser] Parsing response: ${response.status} (${duration}ms)`);

    // Parse body based on content type
    let data: any;
    let body = '';

    if (typeof response.data === 'string') {
      body = response.data;
      data = this.parseBody(body, response.headers as Record<string, any>);
    } else if (response.data) {
      // If already parsed (axios auto-parses JSON)
      body = JSON.stringify(response.data);
      data = response.data;
    }

    return {
      statusCode: response.status,
      headers: response.headers as Record<string, string | string[]>,
      body,
      data,
      duration,
      timestamp: endTime,
    };
  }

  /**
   * Parse response body based on Content-Type
   */
  private static parseBody(body: string, headers: Record<string, any>): any {
    const contentType = this.getContentType(headers);

    logger.debug(`[ResponseParser] Detected content type: ${contentType}`);

    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(body);
      } catch (error) {
        logger.warn(`[ResponseParser] Failed to parse JSON: ${error}`);
        return null;
      }
    }

    if (contentType.includes('application/xml')) {
      // TODO: Implement XML parsing
      logger.warn('[ResponseParser] XML parsing not yet implemented');
      return null;
    }

    // Return plain text
    return body;
  }

  /**
   * Extract Content-Type from headers (case-insensitive)
   */
  private static getContentType(headers: Record<string, string | string[]>): string {
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === 'content-type') {
        if (Array.isArray(value)) {
          return value[0] || '';
        }
        return value || '';
      }
    }
    return 'text/plain';
  }

  /**
   * Extract nested value from response using JSON path
   * Examples: body.user.id, body.data[0].name, headers['Content-Type']
   */
  static extractValue(response: HttpResponse, path: string): any {
    logger.debug(`[ResponseParser] Extracting value: ${path}`);

    // Special accessors
    if (path === 'status') {
      return response.statusCode;
    }
    if (path === 'time') {
      return response.duration;
    }

    // Extract from body
    if (path.startsWith('body.')) {
      const bodyPath = path.substring(5); // Remove 'body.'
      return this.getNestedValue(response.data, bodyPath);
    }

    // Extract from headers
    if (path.startsWith('headers[')) {
      const match = path.match(/headers\['(.+?)'\]/) || path.match(/headers\["(.+?)"\]/);
      if (match) {
        const headerName = match[1];
        return this.getHeaderValue(response.headers, headerName);
      }
    }

    return undefined;
  }

  /**
   * Get nested value from object using dot notation and array indices
   * Examples: user.id, data[0].name, deeply.nested.value
   */
  private static getNestedValue(obj: any, path: string): any {
    const parts = path.split(/[\.\[\]]/).filter(p => p);

    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array index
      if (/^\d+$/.test(part)) {
        current = current[parseInt(part)];
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Get header value (case-insensitive)
   */
  private static getHeaderValue(
    headers: Record<string, string | string[]>,
    name: string
  ): string | string[] | undefined {
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === name.toLowerCase()) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Check if value exists (not null, not undefined, not empty)
   */
  static exists(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string' && value === '') {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Check if value contains substring or includes array item
   */
  static contains(value: any, search: any): boolean {
    if (typeof value === 'string') {
      return value.includes(String(search));
    }
    if (Array.isArray(value)) {
      return value.includes(search);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => this.contains(v, search));
    }
    return false;
  }

  /**
   * Check if value matches regex pattern
   */
  static matches(value: any, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(String(value));
    } catch (error) {
      logger.error(`[ResponseParser] Invalid regex pattern: ${pattern}`);
      return false;
    }
  }
}
