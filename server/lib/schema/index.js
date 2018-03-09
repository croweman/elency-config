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
  const schema = JSON.parse(JSONSchema);
  const transformedConfiguration = transformConfiguration(schema, configuration);
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  validationResult.valid = validate(transformedConfiguration);

  if (!validationResult.valid) {
    validate.errors.forEach(error => {
      if (error.dataPath) {
        validationResult.errors.push(`${error.dataPath}: ${error.message}`);
      } else {
        validationResult.errors.push(`${error.message}`);
      }
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

const transformConfiguration = (schema, configuration) => {
  const transformedConfiguration = {};
  const { properties }  = schema;
  
  configuration.configuration.forEach(configurationKey => {
    transformedConfiguration[configurationKey.key] = configurationKey.value;

    const property = properties[configurationKey.key];
    if (!property || !property.type || typeof property.type !== 'string') return;

    const type = property.type.toLowerCase();

    if (type.toLowerCase() === 'array') {
      try {
        const result = JSON.parse(configurationKey.value);
        if (Array.isArray(result)) {
          transformedConfiguration[configurationKey.key] = result;
        }
      }
      catch (err) {}
      return;
    }

    if (type === 'object') {
      try {
        const result = JSON.parse(configurationKey.value);
        transformedConfiguration[configurationKey.key] = result;
      }
      catch (err) {}
      return;
    }

    if (type === 'number') {
      try {
        const result = parseFloat(configurationKey.value);
        if (!isNaN(result)) {
          transformedConfiguration[configurationKey.key] = result;
        }
      }
      catch (err) {}
      return;
    }

    if (type === 'integer') {
      try {
        const result = parseInt(configurationKey.value);
        if (!isNaN(result)) {
          transformedConfiguration[configurationKey.key] = result;
        }
      }
      catch (err) {}
      return;
    }

    if (type === 'boolean') {
      try {
        const value = configurationKey.value;
        if (value === 'true') {
          transformedConfiguration[configurationKey.key] = true;
        }
        if (value === 'false') {
          transformedConfiguration[configurationKey.key] = false;
        }
      }
      catch (err) {}
      return;
    }
    
  });

  return transformedConfiguration;
};

module.exports = {
  validateSchema,
  validate
};