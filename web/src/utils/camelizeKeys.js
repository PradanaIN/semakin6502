function toCamel(str) {
  return str.replace(/[_-](\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

export default function camelizeKeys(data) {
  if (Array.isArray(data)) {
    return data.map(camelizeKeys);
  }
  if (data && typeof data === 'object' && data.constructor === Object) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[toCamel(key)] = camelizeKeys(value);
      return acc;
    }, {});
  }
  return data;
}
