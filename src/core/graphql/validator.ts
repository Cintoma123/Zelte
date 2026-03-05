/**
 * GraphQL Schema Validator
 * Validates GraphQL operations against schema
 */

export interface GraphQLSchema {
  types: Record<string, GraphQLType>;
  queryType?: string;
  mutationType?: string;
}

export interface GraphQLType {
  name: string;
  kind: 'SCALAR' | 'OBJECT' | 'INTERFACE' | 'UNION' | 'ENUM' | 'INPUT_OBJECT' | 'LIST' | 'NON_NULL';
  fields?: Record<string, GraphQLField>;
  possibleTypes?: string[];
  enumValues?: string[];
  inputFields?: Record<string, GraphQLInputField>;
  ofType?: string;
}

export interface GraphQLField {
  name: string;
  type: GraphQLFieldType;
  args?: Record<string, GraphQLInputField>;
  description?: string;
}

export interface GraphQLFieldType {
  kind: string;
  name?: string;
  ofType?: GraphQLFieldType;
}

export interface GraphQLInputField {
  name: string;
  type: GraphQLFieldType;
  defaultValue?: any;
  description?: string;
}

export class GraphQLValidator {
  private schema?: GraphQLSchema;

  constructor(schema?: GraphQLSchema) {
    this.schema = schema;
  }

  /**
   * Set schema for validation
   */
  setSchema(schema: GraphQLSchema): void {
    this.schema = schema;
  }

  /**
   * Validate a GraphQL query/mutation/subscription
   */
  validate(operation: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!operation) {
      errors.push('No operation provided');
      return { valid: false, errors };
    }

    // Validate operation type
    if (!['query', 'mutation', 'subscription'].includes(operation.type)) {
      errors.push(`Invalid operation type: ${operation.type}`);
    }

    // Validate variables if schema exists
    if (this.schema && operation.variables) {
      const variableErrors = this.validateVariables(operation.variables);
      errors.push(...variableErrors);
    }

    // Validate selections if schema exists
    if (this.schema && operation.selections) {
      const selectionErrors = this.validateSelections(operation.selections, operation.type);
      errors.push(...selectionErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate GraphQL variables
   */
  private validateVariables(variables: any[]): string[] {
    const errors: string[] = [];

    for (const variable of variables) {
      // Check if variable type is valid
      if (!variable.type) {
        errors.push(`Variable $${variable.name} has no type specified`);
      }

      // Check for proper GraphQL type format
      const typeStr = variable.type;
      if (!this.isValidTypeString(typeStr)) {
        errors.push(`Variable $${variable.name} has invalid type: ${typeStr}`);
      }
    }

    return errors;
  }

  /**
   * Validate field selections
   */
  private validateSelections(selections: any[], operationType: string): string[] {
    const errors: string[] = [];

    if (!this.schema) {
      return errors; // No schema, can't validate
    }

    const rootTypeName =
      operationType === 'mutation'
        ? this.schema.mutationType
        : operationType === 'subscription'
          ? 'Subscription'
          : this.schema.queryType;

    if (!rootTypeName) {
      errors.push(`No ${operationType} type defined in schema`);
      return errors;
    }

    const rootType = this.schema.types[rootTypeName];
    if (!rootType) {
      errors.push(`Root type ${rootTypeName} not found in schema`);
      return errors;
    }

    for (const selection of selections) {
      const fieldErrors = this.validateField(selection, rootType);
      errors.push(...fieldErrors);
    }

    return errors;
  }

  /**
   * Validate a single field
   */
  private validateField(selection: any, parentType: GraphQLType): string[] {
    const errors: string[] = [];

    if (!parentType.fields || !parentType.fields[selection.name]) {
      errors.push(`Field ${selection.name} does not exist on type ${parentType.name}`);
      return errors;
    }

    const field = parentType.fields[selection.name];

    // Validate arguments if present
    if (selection.arguments) {
      const argErrors = this.validateArguments(selection.arguments, field.args || {}, selection.name);
      errors.push(...argErrors);
    }

    // Validate subselections if present
    if (selection.subselections) {
      const fieldType = this.getNamedType(field.type);
      const fieldTypeObj = this.schema?.types[fieldType];

      if (fieldTypeObj && fieldTypeObj.fields) {
        for (const subselection of selection.subselections) {
          const subErrors = this.validateField(subselection, fieldTypeObj);
          errors.push(...subErrors);
        }
      }
    }

    return errors;
  }

  /**
   * Validate field arguments
   */
  private validateArguments(
    args: Record<string, any>,
    expectedArgs: Record<string, GraphQLInputField>,
    fieldName: string
  ): string[] {
    const errors: string[] = [];

    // Check for required arguments
    for (const [argName, argDef] of Object.entries(expectedArgs)) {
      if (this.isRequiredType(argDef.type) && !args[argName]) {
        errors.push(`Required argument ${fieldName}(${argName}) is missing`);
      }
    }

    // Check for unexpected arguments
    for (const argName of Object.keys(args)) {
      if (!expectedArgs[argName]) {
        errors.push(`Unknown argument ${fieldName}(${argName})`);
      }
    }

    return errors;
  }

  /**
   * Get named type from type definition
   */
  private getNamedType(fieldType: GraphQLFieldType): string {
    if (fieldType.name) {
      return fieldType.name;
    }
    if (fieldType.ofType) {
      return this.getNamedType(fieldType.ofType);
    }
    return 'Unknown';
  }

  /**
   * Check if a type is required (NON_NULL)
   */
  private isRequiredType(fieldType: GraphQLFieldType): boolean {
    return fieldType.kind === 'NON_NULL';
  }

  /**
   * Check if string is valid GraphQL type format
   */
  private isValidTypeString(typeStr: string): boolean {
    // Valid patterns: Type, Type!, [Type], [Type]!, [Type!]!, etc.
    const validPattern = /^([A-Z]\w*)(!|\[\]|\[[A-Z]\w*\]!?!?)?$/;
    return validPattern.test(typeStr);
  }
}

export function createGraphQLValidator(schema?: GraphQLSchema): GraphQLValidator {
  return new GraphQLValidator(schema);
}
