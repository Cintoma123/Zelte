/**
 * Input Validation Utilities
 * Common validation functions for user input
 */

import { HttpMethod } from '../types/index';

/**
 * Validate HTTP method
 */
export function isValidHttpMethod(method: string): method is HttpMethod {
  const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  return validMethods.includes(method.toUpperCase() as HttpMethod);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file path
 */
export function isValidFilePath(path: string): boolean {
  // Basic validation - no null bytes or invalid characters
  return path.length > 0 && !path.includes('\0');
}

/**
 * Validate regex pattern
 */
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate timeout value
 */
export function isValidTimeout(timeout: number): boolean {
  return timeout > 0 && timeout <= 600000; // Max 10 minutes
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate collection name
 */
export function isValidName(name: string): boolean {
  return name.length > 0 && name.length <= 256;
}

/**
 * Sanitize filename (remove unsafe characters)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 255);
}

/**
 * Escape special characters in string
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Validate assertion syntax
 */
export function hasValidAssertionSyntax(assertion: string): boolean {
  // Check for common patterns
  const patterns = [
    /\s*(==|!=|>|<|>=|<=)\s/,  // Comparison operators
    /\s+exists$/,               // exists check
    /\s+contains\s/,            // contains check
    /\s+matches\s+\/.*\/[gimuy]*$/,  // regex match
  ];

  return patterns.some((pattern) => pattern.test(assertion));
}
