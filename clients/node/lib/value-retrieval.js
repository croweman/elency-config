function getBoolean(value, fallback) {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  if (typeof value === 'string' && (value === '1' || value.toLowerCase() === 'true')) {
    return true;
  }

  if (typeof value === 'string' && (value === '0' || value.toLowerCase() === 'false')) {
    return false;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}

function getDate(value, fallback) {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    let date = new Date(value);

    if (Object.prototype.toString.call(date) === "[object Date]") {
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}

function getInt(value, fallback) {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  let parsedNumber = parseInt(value);

  if (!isNaN(parsedNumber)) {
    return parsedNumber;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}

function getFloat(value, fallback) {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  let parsedFloat = parseFloat(value);

  if (!isNaN(parsedFloat)) {
    return parsedFloat;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}

function getObject(value, fallback) {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  try {
    let parsedObject = JSON.parse(value);

    if (parsedObject !== null) {
      return parsedObject;
    }
  }
  catch (err) {}

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}

module.exports = {
  getBoolean,
  getDate,
  getInt,
  getFloat,
  getObject
};