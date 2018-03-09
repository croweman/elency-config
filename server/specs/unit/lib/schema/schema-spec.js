const { expect } = require('chai');
const schema = require('../../../../lib/schema');

describe('schema', () => {
  describe('validateSchema', () => {
    describe('returns true', () => {
      it('when the JSONSchema is undefined', () => {
        const valid = schema.validateSchema(undefined);
        expect(valid).to.eql(true);
      });

      it('when the JSONSchema is null', () => {
        const valid = schema.validateSchema(null);
        expect(valid).to.eql(true);
      });

      it('when the JSONSchema is an empty string', () => {
        const valid = schema.validateSchema('');
        expect(valid).to.eql(true);
      });

      it('when the JSONSchema is a valid schema', () => {
        const JSONSchema = {
            "properties": {
              "LOG_LEVEL": {
                "type": "string",
                "minLength": 1,
              },
              "MONGODB_URL": {
                "type": "string",
                "minLength": 1,
              }
            },
            "required": [
              "LOG_LEVEL",
              "MONGODB_URL"
            ]
          };

        const valid = schema.validateSchema(JSON.stringify(JSONSchema));
        expect(valid).to.eql(true);
      });
    });

    describe('returns false', () => {
      it('when the JSONSchema is invalid', () => {
        const valid = schema.validateSchema('asdf');
        expect(valid).to.eql(false);
      });
    });
  });

  describe('validate', () => {
    describe('returns true', () => {
      it('when configuration conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "LOG_LEVEL": {
              "type": "string",
              "minLength": 1
            },
            "MONGODB_URL": {
              "type": "string",
              "minLength": 1
            }
          },
          "required": [
            "LOG_LEVEL",
            "MONGODB_URL"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "LOG_LEVEL",
              "value": "NONE",
              "encrypted": false
            },
            {
              "key": "MONGODB_URL",
              "value": "mongodb://localhost:27017/db",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });

      it('when configuration with an array conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "ITEMS": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "minItems": 1
            }
          },
          "required": [
            "ITEMS"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "ITEMS",
              "value": "[ \"fish\" ]",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });

      it('when configuration with an object conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "OBJ": {
              "type": "object",
              "properties": {
                "foo": {
                  "type": "string"
                }
              },
              "required": [
                "foo"
              ]
            }
          },
          "required": [
            "OBJ"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "OBJ",
              "value": "{ \"foo\": \"bar\" }",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });

      it('when configuration with a number conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "property": {
              "type": "number"
            }
          },
          "required": [
            "property"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "property",
              "value": "2.234",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });

      it('when configuration with a integer conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "property": {
              "type": "integer"
            }
          },
          "required": [
            "property"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "property",
              "value": "2",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });

      it('when configuration with a boolean conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "property": {
              "type": "boolean"
            }
          },
          "required": [
            "property"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "property",
              "value": "true",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });

      it('when configuration with an enum conforms to schema', () => {
        const JSONSchema = {
          "properties": {
            "property": {
              "type": "string",
              "enum": ["red", "amber", "green"]
            }
          },
          "required": [
            "property"
          ]
        };

        const configuration = {
          "configuration": [
            {
              "key": "property",
              "value": "red",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(true);
        expect(validationResult.errors.length).to.eql(0);
      });
    });

    describe('returns false', () => {
      it('when configuration does not conform to schema', () => {
        const JSONSchema = {
          "properties": {
            "LOG_LEVEL": {
              "type": "string",
              "minLength": 1
            },
            "MONGODB_URL": {
              "type": "string",
              "minLength": 1
            }
          },
          "required": [
            "LOG_LEVEL",
            "MONGODB_URL"
          ]
        };

        const configuration = {
          configuration: []
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(false);
        expect(validationResult.errors.length).to.eql(2);
        expect(validationResult.errors[0]).to.eql("should have required property 'LOG_LEVEL'");
        expect(validationResult.errors[1]).to.eql("should have required property 'MONGODB_URL'");
      });

      it('when configuration conforms to schema but items that should be secure are not secure', () => {
        const JSONSchema = {
          "properties": {
            "LOG_LEVEL": {
              "type": "string",
              "minLength": 1
            },
            "MONGODB_URL": {
              "type": "string",
              "minLength": 1,
              "secure": true
            }
          },
          "required": [
            "LOG_LEVEL",
            "MONGODB_URL"
          ]
        };

        const configuration = {
          configuration: [
            {
              "key": "LOG_LEVEL",
              "value": "NONE",
              "encrypted": false
            },
            {
              "key": "MONGODB_URL",
              "value": "mongodb://localhost:27017/db",
              "encrypted": false
            }
          ]
        };

        const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
        expect(validationResult.valid).to.eql(false);
        expect(validationResult.errors.length).to.eql(1);
        expect(validationResult.errors[0]).to.eql("property 'MONGODB_URL' should be marked as Encrypted");
      });

      describe('string', () => {
        it('when a configuration contains a property value that does not meet regex', () => {
          const JSONSchema = {
            "properties": {
              "property": {
                "type": "string",
                "pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
              }
            },
            "required": [
              "property"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "property",
                "value": "",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.property: should match pattern "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"');
        });

        it('when a configuration contains a property value that does not meet minLength', () => {
          const JSONSchema = {
            "properties": {
              "property": {
                "type": "string",
                "minLength": 2
              }
            },
            "required": [
              "property"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "property",
                "value": "",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.property: should NOT be shorter than 2 characters');
        });

        it('when a configuration contains a property value that does not meet maxLength', () => {
          const JSONSchema = {
            "properties": {
              "property": {
                "type": "string",
                "maxLength": 5
              }
            },
            "required": [
              "property"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "property",
                "value": "123456",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.property: should NOT be longer than 5 characters');
        });
      });

      describe('object', () => {
        it('when a configuration contains an object property value that does not meet minLength', () => {
          const JSONSchema = {
            "properties": {
              "OBJ": {
                "type": "object",
                "properties": {
                  "foo": {
                    "type": "string",
                    "minLength": 2
                  }
                },
                "required": [
                  "foo"
                ]
              }
            },
            "required": [
              "OBJ"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "OBJ",
                "value": "{ \"foo\": \"b\" }",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.OBJ.foo: should NOT be shorter than 2 characters');
        });

        it('when a configuration contains an incorrect object property value', () => {
          const JSONSchema = {
            "properties": {
              "OBJ": {
                "type": "object",
                "properties": {
                  "foo": {
                    "type": "string",
                    "minLength": 2
                  }
                },
                "required": [
                  "foo"
                ]
              }
            },
            "required": [
              "OBJ"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "OBJ",
                "value": "",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.OBJ: should be object');
        });
      });

      describe('array', () => {
        it('when a configuration contains an array property value that does not meet minItems', () => {
          const JSONSchema = {
            "properties": {
              "ITEMS": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "minItems": 2
              }
            },
            "required": [
              "ITEMS"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "ITEMS",
                "value": "[ \"fish\" ]",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.ITEMS: should NOT have less than 2 items');
        });

        it('when a configuration contains an array property with an object string property that does not meet minLength', () => {
          const JSONSchema = {
            "properties": {
              "ITEMS": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "property": {
                      "type": "string",
                      "minLength": 2
                    }
                  },
                  "required": [
                    "property"
                  ]
                },
                "minItems": 3
              }
            },
            "required": [
              "ITEMS"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "ITEMS",
                "value": "[ { \"property\": \"1\" }, { \"property\": \"2\" } ]",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(3);
          expect(validationResult.errors[0]).to.eql('.ITEMS: should NOT have less than 3 items');
          expect(validationResult.errors[1]).to.eql('.ITEMS[0].property: should NOT be shorter than 2 characters');
          expect(validationResult.errors[2]).to.eql('.ITEMS[1].property: should NOT be shorter than 2 characters');
        });
      });

      describe('number', () => {
        it('when a configuration contains a number property which is invalid', () => {
          const JSONSchema = {
            "properties": {
              "property": {
                "type": "number"
              }
            },
            "required": [
              "property"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "property",
                "value": "asdf",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.property: should be number');
        });
      });

      describe('integer', () => {
        it('when a configuration contains a integer property which is invalid', () => {
          const JSONSchema = {
            "properties": {
              "property": {
                "type": "integer"
              }
            },
            "required": [
              "property"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "property",
                "value": "asdf",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.property: should be integer');
        });
      });

      describe('enum', () => {
        it('when a configuration contains a enum property which is invalid', () => {
          const JSONSchema = {
            "properties": {
              "property": {
                "type": "string",
                "enum": ["red", "amber", "green"]
              }
            },
            "required": [
              "property"
            ]
          };

          const configuration = {
            "configuration": [
              {
                "key": "property",
                "value": "blue",
                "encrypted": false
              }
            ]
          };

          const validationResult = schema.validate(JSON.stringify(JSONSchema), configuration);
          expect(validationResult.valid).to.eql(false);
          expect(validationResult.errors.length).to.eql(1);
          expect(validationResult.errors[0]).to.eql('.property: should be equal to one of the allowed values: ["red","amber","green"]');
        });
      });
    });
  });

  describe('getSchemaRequiredProperties', () => {
    it('returns all top level required properties defined on a schema', () => {
      const JSONSchema = {
        "properties": {
          "LOG_LEVEL": {
            "type": "string",
            "minLength": 1
          },
          "MONGODB_URL": {
            "type": "string",
            "minLength": 1,
            "secure": true
          },
          "NON_REQUIRED_PROPERTY": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "LOG_LEVEL",
          "MONGODB_URL"
        ]
      };

      const properties = schema.getSchemaRequiredProperties(JSONSchema);
      expect(properties.length).to.eql(2);
      expect(properties[0].name).to.eql('LOG_LEVEL');
      expect(properties[0].secure).to.eql(false);
      expect(properties[0].type).to.eql('string');
      expect(properties[1].name).to.eql('MONGODB_URL');
      expect(properties[1].secure).to.eql(true);
      expect(properties[1].type).to.eql('string');
    });
  });
});