/**
 * GraphQL Query Parser
 * Parses and validates GraphQL query syntax
 */

export interface GraphQLQuery {
  type: 'query' | 'mutation' | 'subscription';
  name?: string;
  variables: GraphQLVariable[];
  selections: GraphQLSelection[];
  raw: string;
}

export interface GraphQLVariable {
  name: string;
  type: string;
  required: boolean;
}

export interface GraphQLSelection {
  name: string;
  alias?: string;
  arguments?: Record<string, any>;
  subselections?: GraphQLSelection[];
}

export class GraphQLParser {
  /**
   * Parse GraphQL query string
   */
  parse(queryString: string): GraphQLQuery {
    const trimmed = queryString.trim();

    // Detect operation type
    const operationMatch = trimmed.match(/^\s*(query|mutation|subscription)\s*/i);
    const type = (operationMatch?.[1] || 'query').toLowerCase() as 'query' | 'mutation' | 'subscription';

    // Extract operation name
    const nameMatch = trimmed.match(/^\s*(?:query|mutation|subscription)\s+(\w+)/i);
    const name = nameMatch?.[1];

    // Extract variables from declaration
    const variables = this.parseVariables(trimmed);

    // Extract field selections
    const selections = this.parseSelections(trimmed);

    return {
      type,
      name,
      variables,
      selections,
      raw: trimmed,
    };
  }

  /**
   * Parse GraphQL variable declarations
   */
  private parseVariables(queryString: string): GraphQLVariable[] {
    const variables: GraphQLVariable[] = [];

    // Find variables declaration: ($var1: Type!, $var2: Type)
    const varDeclMatch = queryString.match(/\(\s*([^)]+)\s*\)/);
    if (!varDeclMatch) {
      return variables;
    }

    const varDecl = varDeclMatch[1];
    // Split by comma, but respect nested brackets
    const varParts = this.splitByComma(varDecl);

    for (const part of varParts) {
      const match = part.trim().match(/\$(\w+)\s*:\s*(.+?)(!)?$/);
      if (match) {
        variables.push({
          name: match[1],
          type: match[2].trim(),
          required: !!match[3],
        });
      }
    }

    return variables;
  }

  /**
   * Parse field selections from query
   */
  private parseSelections(queryString: string): GraphQLSelection[] {
    // Find the opening brace of the selection set
    const firstBraceIndex = queryString.indexOf('{');
    if (firstBraceIndex === -1) {
      return [];
    }

    const selectionContent = this.extractBraceContent(queryString, firstBraceIndex);
    return this.parseFieldSet(selectionContent);
  }

  /**
   * Parse a set of fields
   */
  private parseFieldSet(content: string): GraphQLSelection[] {
    const fields: GraphQLSelection[] = [];
    const lines = content.split('\n');

    let currentField = '';
    let braceDepth = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      for (const char of trimmedLine) {
        currentField += char;
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;

        // Process complete field when we're back at depth 0 and encounter certain delimiters
        if (
          braceDepth === 0 &&
          (char === '\n' || currentField.trim().endsWith('}'))
        ) {
          const field = currentField.trim();
          if (field && !field.startsWith('}')) {
            const parsed = this.parseField(field);
            if (parsed) {
              fields.push(parsed);
            }
            currentField = '';
          }
        }
      }

      // Handle line ending at depth 0
      if (braceDepth === 0 && currentField.trim()) {
        const field = currentField.trim();
        if (field && !field.startsWith('}')) {
          const parsed = this.parseField(field);
          if (parsed) {
            fields.push(parsed);
          }
          currentField = '';
        }
      }
    }

    return fields;
  }

  /**
   * Parse a single field
   */
  private parseField(fieldString: string): GraphQLSelection | null {
    const trimmed = fieldString.trim();
    if (!trimmed) {
      return null;
    }

    // Handle pattern: fieldName or alias: fieldName or fieldName(args): { subfields }
    let match = trimmed.match(/^(\w+)\s*:\s*(\w+)(\(.*?\))?(.*)$/);
    if (!match) {
      match = trimmed.match(/^(\w+)(\(.*?\))?(.*)$/);
      if (!match) {
        return null;
      }

      const name = match[1];
      const argsStr = match[2];
      const rest = match[3];

      return {
        name,
        arguments: argsStr ? this.parseArguments(argsStr) : undefined,
        subselections: rest.includes('{') ? this.parseSelections(rest) : undefined,
      };
    }

    const alias = match[1];
    const name = match[2];
    const argsStr = match[3];
    const rest = match[4];

    return {
      name,
      alias,
      arguments: argsStr ? this.parseArguments(argsStr) : undefined,
      subselections: rest.includes('{') ? this.parseSelections(rest) : undefined,
    };
  }

  /**
   * Parse GraphQL arguments
   */
  private parseArguments(argsString: string): Record<string, any> {
    const args: Record<string, any> = {};
    const content = argsString.slice(1, -1); // Remove parentheses

    const argPairs = this.splitByComma(content);
    for (const pair of argPairs) {
      const match = pair.trim().match(/^(\w+)\s*:\s*(.+)$/);
      if (match) {
        const key = match[1];
        const value = match[2].trim();
        args[key] = value; // Values are kept as strings for variable resolution
      }
    }

    return args;
  }

  /**
   * Extract content between braces
   */
  private extractBraceContent(str: string, startIndex: number): string {
    let braceCount = 0;
    let start = -1;
    let end = -1;

    for (let i = startIndex; i < str.length; i++) {
      if (str[i] === '{') {
        if (start === -1) {
          start = i + 1;
        }
        braceCount++;
      } else if (str[i] === '}') {
        braceCount--;
        if (braceCount === 0 && start !== -1) {
          end = i;
          break;
        }
      }
    }

    return start !== -1 && end !== -1 ? str.slice(start, end) : '';
  }

  /**
   * Split string by commas, respecting nested structures
   */
  private splitByComma(str: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (const char of str) {
      if ((char === '"' || char === "'") && inString === false) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (char === stringChar && inString) {
        inString = false;
        current += char;
      } else if (!inString) {
        if (char === '(' || char === '{' || char === '[') {
          depth++;
          current += char;
        } else if (char === ')' || char === '}' || char === ']') {
          depth--;
          current += char;
        } else if (char === ',' && depth === 0) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Validate GraphQL query syntax
   */
  validateSyntax(queryString: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for balanced braces
    const braceCount = (queryString.match(/{/g) || []).length;
    const closeBraceCount = (queryString.match(/}/g) || []).length;
    if (braceCount !== closeBraceCount) {
      errors.push(`Unbalanced braces: ${braceCount} opening, ${closeBraceCount} closing`);
    }

    // Check for balanced parentheses
    const parenCount = (queryString.match(/\(/g) || []).length;
    const closeParenCount = (queryString.match(/\)/g) || []).length;
    if (parenCount !== closeParenCount) {
      errors.push(`Unbalanced parentheses: ${parenCount} opening, ${closeParenCount} closing`);
    }

    // Check for balanced brackets
    const bracketCount = (queryString.match(/\[/g) || []).length;
    const closeBracketCount = (queryString.match(/\]/g) || []).length;
    if (bracketCount !== closeBracketCount) {
      errors.push(`Unbalanced brackets: ${bracketCount} opening, ${closeBracketCount} closing`);
    }

    // Check for valid operation type
    const operationMatch = queryString.match(/^\s*(query|mutation|subscription)\s/i);
    if (!operationMatch) {
      // If no explicit operation, assume query
      if (!queryString.trim().startsWith('{')) {
        errors.push('Invalid GraphQL syntax: Expected query, mutation, subscription, or opening brace');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export function createGraphQLParser(): GraphQLParser {
  return new GraphQLParser();
}
