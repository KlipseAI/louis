/**
 * Validate JSON data with the deliberately small JSON Schema 2020-12 subset
 * used by the design-system catalog and generated debt registry.
 *
 * This is not a general-purpose JSON Schema implementation. Keeping the
 * supported keywords explicit makes the repository's build-time contract
 * deterministic without adding a runtime dependency.
 *
 * @param {object | boolean} schema
 * @param {unknown} value
 * @returns {{ path: string, message: string }[]}
 */
export function validateJsonSchema(schema, value) {
  if (!isSchema(schema)) {
    throw new TypeError("JSON Schema must be an object or boolean.");
  }
  assertSupportedSchema(schema, "#", new WeakSet());

  const errors = [];
  const context = {
    rootSchema: schema,
    references: new Map(),
    depth: 0,
  };
  validateValue(schema, value, "$", context, errors);
  return errors;
}

const supportedSchemaKeywords = new Set([
  "$schema",
  "$id",
  "$defs",
  "$ref",
  "title",
  "description",
  "type",
  "const",
  "enum",
  "oneOf",
  "anyOf",
  "properties",
  "required",
  "additionalProperties",
  "propertyNames",
  "items",
  "minItems",
  "uniqueItems",
  "minLength",
  "maxLength",
  "pattern",
  "minimum",
]);

function assertSupportedSchema(schema, path, seen) {
  if (typeof schema === "boolean" || seen.has(schema)) return;
  if (!isObject(schema)) throw new TypeError(`Invalid JSON Schema at ${path}.`);
  seen.add(schema);

  for (const keyword of Object.keys(schema)) {
    if (!supportedSchemaKeywords.has(keyword)) {
      throw new TypeError(
        `Unsupported JSON Schema keyword at ${path}: ${keyword}`,
      );
    }
  }

  for (const [keyword, collection] of [
    ["$defs", schema.$defs],
    ["properties", schema.properties],
  ]) {
    if (collection === undefined) continue;
    if (!isObject(collection)) {
      throw new TypeError(
        `JSON Schema ${keyword} at ${path} must be an object.`,
      );
    }
    for (const [name, child] of Object.entries(collection)) {
      if (!isSchema(child)) {
        throw new TypeError(
          `JSON Schema ${keyword}.${name} at ${path} must be an object or boolean.`,
        );
      }
      assertSupportedSchema(child, `${path}/${keyword}/${name}`, seen);
    }
  }

  for (const keyword of ["items", "additionalProperties", "propertyNames"]) {
    const child = schema[keyword];
    if (child === undefined) continue;
    if (!isSchema(child)) {
      throw new TypeError(
        `JSON Schema ${keyword} at ${path} must be an object or boolean.`,
      );
    }
    assertSupportedSchema(child, `${path}/${keyword}`, seen);
  }

  for (const keyword of ["oneOf", "anyOf"]) {
    const children = schema[keyword];
    if (children === undefined) continue;
    if (!Array.isArray(children) || children.length === 0) {
      throw new TypeError(
        `JSON Schema ${keyword} at ${path} must be a non-empty array.`,
      );
    }
    children.forEach((child, index) => {
      if (!isSchema(child)) {
        throw new TypeError(
          `JSON Schema ${keyword}[${index}] at ${path} must be an object or boolean.`,
        );
      }
      assertSupportedSchema(child, `${path}/${keyword}/${index}`, seen);
    });
  }
}

function validateValue(schema, value, path, context, errors) {
  if (schema === true) return;
  if (schema === false) {
    errors.push({ path, message: "value is rejected by the schema" });
    return;
  }
  if (!isObject(schema)) {
    throw new TypeError(`Invalid JSON Schema at ${path}.`);
  }
  if (context.depth > 512) {
    throw new Error("JSON Schema validation exceeded the maximum depth.");
  }

  const nextContext = { ...context, depth: context.depth + 1 };

  if (schema.$ref !== undefined) {
    if (typeof schema.$ref !== "string") {
      throw new TypeError(`JSON Schema $ref at ${path} must be a string.`);
    }
    const referencedSchema = resolveReference(schema.$ref, context);
    validateValue(referencedSchema, value, path, nextContext, errors);
  }

  if (schema.const !== undefined && !jsonEqual(value, schema.const)) {
    errors.push({
      path,
      message: `must equal ${describe(schema.const)}`,
    });
  }

  if (schema.enum !== undefined) {
    if (!Array.isArray(schema.enum)) {
      throw new TypeError(`JSON Schema enum at ${path} must be an array.`);
    }
    if (!schema.enum.some((candidate) => jsonEqual(value, candidate))) {
      errors.push({
        path,
        message: `must be one of ${schema.enum.map(describe).join(", ")}`,
      });
    }
  }

  if (schema.type !== undefined && !matchesType(value, schema.type)) {
    const expected = Array.isArray(schema.type)
      ? schema.type.join(" or ")
      : String(schema.type);
    errors.push({
      path,
      message: `must be ${articleFor(expected)} ${expected}`,
    });
    return;
  }

  validateAlternatives(schema, value, path, nextContext, errors);

  if (typeof value === "string") {
    validateString(schema, value, path, errors);
  }
  if (Array.isArray(value)) {
    validateArray(schema, value, path, nextContext, errors);
  }
  if (isObject(value)) {
    validateObject(schema, value, path, nextContext, errors);
  }
  if (typeof value === "number" && schema.minimum !== undefined) {
    if (typeof schema.minimum !== "number") {
      throw new TypeError(`JSON Schema minimum at ${path} must be a number.`);
    }
    if (value < schema.minimum) {
      errors.push({
        path,
        message: `must be greater than or equal to ${schema.minimum}`,
      });
    }
  }
}

function validateAlternatives(schema, value, path, context, errors) {
  if (schema.oneOf !== undefined) {
    const alternatives = validateAlternativeList(
      "oneOf",
      schema.oneOf,
      value,
      path,
      context,
    );
    const matching = alternatives.filter((candidate) => candidate.length === 0);
    if (matching.length !== 1) {
      errors.push({
        path,
        message: `must match exactly one oneOf schema; matched ${matching.length}`,
      });
      if (matching.length === 0) errors.push(...fewestErrors(alternatives));
    }
  }

  if (schema.anyOf !== undefined) {
    const alternatives = validateAlternativeList(
      "anyOf",
      schema.anyOf,
      value,
      path,
      context,
    );
    if (!alternatives.some((candidate) => candidate.length === 0)) {
      errors.push({ path, message: "must match at least one anyOf schema" });
      errors.push(...fewestErrors(alternatives));
    }
  }
}

function validateAlternativeList(keyword, schemas, value, path, context) {
  if (!Array.isArray(schemas) || schemas.length === 0) {
    throw new TypeError(
      `JSON Schema ${keyword} at ${path} must be a non-empty array.`,
    );
  }
  return schemas.map((candidate) => {
    if (!isSchema(candidate)) {
      throw new TypeError(
        `JSON Schema ${keyword} candidate at ${path} must be an object or boolean.`,
      );
    }
    const candidateErrors = [];
    validateValue(candidate, value, path, context, candidateErrors);
    return candidateErrors;
  });
}

function validateString(schema, value, path, errors) {
  const length = [...value].length;
  if (schema.minLength !== undefined) {
    if (!Number.isInteger(schema.minLength) || schema.minLength < 0) {
      throw new TypeError(
        `JSON Schema minLength at ${path} must be a non-negative integer.`,
      );
    }
    if (length < schema.minLength) {
      errors.push({
        path,
        message: `must contain at least ${schema.minLength} characters`,
      });
    }
  }
  if (schema.maxLength !== undefined) {
    if (!Number.isInteger(schema.maxLength) || schema.maxLength < 0) {
      throw new TypeError(
        `JSON Schema maxLength at ${path} must be a non-negative integer.`,
      );
    }
    if (length > schema.maxLength) {
      errors.push({
        path,
        message: `must contain no more than ${schema.maxLength} characters`,
      });
    }
  }
  if (schema.pattern !== undefined) {
    if (typeof schema.pattern !== "string") {
      throw new TypeError(`JSON Schema pattern at ${path} must be a string.`);
    }
    let expression;
    try {
      expression = new RegExp(schema.pattern);
    } catch (error) {
      throw new TypeError(
        `Invalid JSON Schema pattern at ${path}: ${error.message}`,
      );
    }
    if (!expression.test(value)) {
      errors.push({ path, message: `must match pattern ${schema.pattern}` });
    }
  }
}

function validateArray(schema, value, path, context, errors) {
  if (schema.minItems !== undefined) {
    if (!Number.isInteger(schema.minItems) || schema.minItems < 0) {
      throw new TypeError(
        `JSON Schema minItems at ${path} must be a non-negative integer.`,
      );
    }
    if (value.length < schema.minItems) {
      errors.push({
        path,
        message: `must contain at least ${schema.minItems} items`,
      });
    }
  }

  if (schema.uniqueItems === true) {
    for (let index = 0; index < value.length; index += 1) {
      for (let previousIndex = 0; previousIndex < index; previousIndex += 1) {
        if (jsonEqual(value[index], value[previousIndex])) {
          errors.push({
            path: `${path}[${index}]`,
            message: `must be unique; duplicates item ${previousIndex}`,
          });
          break;
        }
      }
    }
  } else if (schema.uniqueItems !== undefined && schema.uniqueItems !== false) {
    throw new TypeError(
      `JSON Schema uniqueItems at ${path} must be a boolean.`,
    );
  }

  if (schema.items !== undefined) {
    if (!isSchema(schema.items)) {
      throw new TypeError(
        `JSON Schema items at ${path} must be an object or boolean.`,
      );
    }
    for (const [index, item] of value.entries()) {
      validateValue(schema.items, item, `${path}[${index}]`, context, errors);
    }
  }
}

function validateObject(schema, value, path, context, errors) {
  const properties = schema.properties ?? {};
  if (!isObject(properties)) {
    throw new TypeError(`JSON Schema properties at ${path} must be an object.`);
  }

  if (schema.required !== undefined) {
    if (!Array.isArray(schema.required)) {
      throw new TypeError(`JSON Schema required at ${path} must be an array.`);
    }
    for (const key of schema.required) {
      if (typeof key !== "string") {
        throw new TypeError(
          `JSON Schema required entries at ${path} must be strings.`,
        );
      }
      if (!Object.hasOwn(value, key)) {
        errors.push({
          path: propertyPath(path, key),
          message: "is required",
        });
      }
    }
  }

  for (const [key, propertySchema] of Object.entries(properties)) {
    if (!isSchema(propertySchema)) {
      throw new TypeError(
        `JSON Schema property ${propertyPath(path, key)} must be an object or boolean.`,
      );
    }
    if (Object.hasOwn(value, key)) {
      validateValue(
        propertySchema,
        value[key],
        propertyPath(path, key),
        context,
        errors,
      );
    }
  }

  if (schema.propertyNames !== undefined) {
    if (!isSchema(schema.propertyNames)) {
      throw new TypeError(
        `JSON Schema propertyNames at ${path} must be an object or boolean.`,
      );
    }
    for (const key of Object.keys(value)) {
      validateValue(
        schema.propertyNames,
        key,
        propertyPath(path, key),
        context,
        errors,
      );
    }
  }

  const additional = schema.additionalProperties;
  if (additional !== undefined && !isSchema(additional)) {
    throw new TypeError(
      `JSON Schema additionalProperties at ${path} must be an object or boolean.`,
    );
  }
  if (additional === undefined || additional === true) return;

  for (const key of Object.keys(value)) {
    if (Object.hasOwn(properties, key)) continue;
    const additionalPath = propertyPath(path, key);
    if (additional === false) {
      errors.push({
        path: additionalPath,
        message: "additional property is not allowed",
      });
    } else {
      validateValue(additional, value[key], additionalPath, context, errors);
    }
  }
}

function resolveReference(reference, context) {
  if (context.references.has(reference)) {
    return context.references.get(reference);
  }
  if (reference === "#") return context.rootSchema;
  if (!reference.startsWith("#/")) {
    throw new Error(
      `Only local JSON Schema references are supported: ${reference}`,
    );
  }

  let resolved = context.rootSchema;
  for (const encodedSegment of reference.slice(2).split("/")) {
    const segment = encodedSegment.replace(/~1/g, "/").replace(/~0/g, "~");
    if (!isObject(resolved) || !Object.hasOwn(resolved, segment)) {
      throw new Error(`JSON Schema reference does not exist: ${reference}`);
    }
    resolved = resolved[segment];
  }
  if (!isSchema(resolved)) {
    throw new TypeError(
      `JSON Schema reference does not resolve to a schema: ${reference}`,
    );
  }
  context.references.set(reference, resolved);
  return resolved;
}

function matchesType(value, expectedType) {
  const types = Array.isArray(expectedType) ? expectedType : [expectedType];
  if (!types.every((type) => typeof type === "string")) {
    throw new TypeError("JSON Schema type must be a string or string array.");
  }
  return types.some((type) => {
    switch (type) {
      case "array":
        return Array.isArray(value);
      case "boolean":
        return typeof value === "boolean";
      case "integer":
        return Number.isInteger(value);
      case "null":
        return value === null;
      case "number":
        return typeof value === "number" && Number.isFinite(value);
      case "object":
        return isObject(value);
      case "string":
        return typeof value === "string";
      default:
        throw new TypeError(`Unsupported JSON Schema type: ${type}`);
    }
  });
}

function isSchema(value) {
  return typeof value === "boolean" || isObject(value);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function jsonEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    return left.every((item, index) => jsonEqual(item, right[index]));
  }
  if (isObject(left) || isObject(right)) {
    if (!isObject(left) || !isObject(right)) return false;
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every(
      (key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key]),
    );
  }
  return false;
}

function propertyPath(path, key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function fewestErrors(alternatives) {
  return alternatives.reduce((best, candidate) =>
    candidate.length < best.length ? candidate : best,
  );
}

function describe(value) {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return String(value);
  return serialized.length > 120
    ? `${serialized.slice(0, 117)}...`
    : serialized;
}

function articleFor(expected) {
  return /^[aeiou]/i.test(expected) ? "an" : "a";
}
