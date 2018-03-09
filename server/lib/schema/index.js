const Ajv = require('ajv');

const validateSchema = (JSONSchema) => {
  if (!JSONSchema) return true;
  try {
    const schema = JSON.parse(JSONSchema);
    const ajv = new Ajv({ allErrors: true });
    return ajv.validateSchema(schema);
  }
  catch (err) {
    return false;
  }
};

const validate = (JSONSchema, configuration) => {
  const validationResult = {
    valid: false,
    errors: []
  };
  let schema = JSONSchema;

  if (typeof schema === 'string') {
    schema = JSON.parse(schema);
  }
  const transformedConfiguration = transformConfiguration(schema, configuration);
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  validationResult.valid = validate(transformedConfiguration);

  if (!validationResult.valid) {
    validate.errors.forEach(error => {
      let errorMessage = '';
      if (error.dataPath) {
        errorMessage = `${error.dataPath}: ${error.message}`;
      } else {
        errorMessage = `${error.message}`;
      }

      if (error.keyword && error.keyword === 'enum' && error.params && error.params.allowedValues) {
        errorMessage += `: ${JSON.stringify(error.params.allowedValues)}`;
      }

      validationResult.errors.push(errorMessage);
    });
  }

  const { properties }  = schema;
  if (properties) {
    Object.keys(properties).forEach(propertyName => {
      const property = properties[propertyName];
      if (typeof property === 'string') return;
      if (!property.secure || property.secure !== true) return;
      const configurationProperty = configuration.configuration.find(item => item.key === propertyName);
      if (!configurationProperty) return;
      if (configurationProperty.encrypted && configurationProperty.encrypted === true) return;
      validationResult.valid = false;
      validationResult.errors.push(`property '${propertyName}' should be marked as Encrypted`);
    });
  }
  
  return validationResult;
};

const getSchemaRequiredProperties = (JSONSchema) => {
  let schema = JSONSchema;

  if (typeof schema === 'string') {
    schema = JSON.parse(schema);
  }

  const requiredProperties = [];
  const { properties, required } = schema;

  if (!properties) {
    return requiredProperties;
  }

  if (!required) {
    return requiredProperties;
  }

  required.forEach(requiredProperty => {
    const definedProperty = properties[requiredProperty];
    if (!definedProperty) return;
    const secure = (definedProperty.secure !== undefined && definedProperty.secure === true);
    let type = '';

    if (definedProperty.type && definedProperty.type === 'string') {
      type = definedProperty.type;
    }
    requiredProperties.push({
      name: requiredProperty,
      secure,
      type
    });
  });
  
  return requiredProperties;
};

const transformConfiguration = (schema, configuration) => {
  const transformedConfiguration = {};
  const { properties }  = schema;
  
  configuration.configuration.forEach(configurationKey => {
    transformedConfiguration[configurationKey.key] = configurationKey.value;

    const property = properties[configurationKey.key];
    if (!property || !property.type || typeof property.type !== 'string') return;

    const type = property.type.toLowerCase();

    try {
      if (type === 'array') {
        const result = JSON.parse(configurationKey.value);
        if (Array.isArray(result)) {
          transformedConfiguration[configurationKey.key] = result;
        }
        return;
      }

      if (type === 'object') {
        const result = JSON.parse(configurationKey.value);
        transformedConfiguration[configurationKey.key] = result;
        return;
      }

      if (type === 'number') {
        const result = parseFloat(configurationKey.value);
        if (!isNaN(result)) {
          transformedConfiguration[configurationKey.key] = result;
        }
        return;
      }

      if (type === 'integer') {
        const result = parseInt(configurationKey.value);
        if (!isNaN(result)) {
          transformedConfiguration[configurationKey.key] = result;
        }
        return;
      }

      if (type === 'boolean') {
        const value = configurationKey.value;
        if (value === 'true') {
          transformedConfiguration[configurationKey.key] = true;
        }
        if (value === 'false') {
          transformedConfiguration[configurationKey.key] = false;
        }
        return;
      }
    }
    catch (err) {}
    
  });

  return transformedConfiguration;
};

module.exports = {
  validateSchema,
  validate,
  getSchemaRequiredProperties
};