/**
 * Safe JSON Parser Utility
 * Handles cases where data might already be an object or needs parsing
 */

/**
 * Safely parse data_surat field from API response
 * @param {string|object} dataSurat - The data_surat field from database
 * @returns {object} Parsed object or empty object on error
 */
export const safeParseDataSurat = (dataSurat) => {
  try {
    if (typeof dataSurat === 'string') {
      return JSON.parse(dataSurat || '{}');
    }
    if (typeof dataSurat === 'object' && dataSurat !== null) {
      return dataSurat;
    }
    return {};
  } catch (error) {
    console.error('Error parsing data_surat:', error);
    return {};
  }
};

/**
 * Safely parse jenis_surat fields (array of field definitions)
 * @param {string|array} fields - The fields from jenis_surat
 * @returns {array} Parsed array or empty array on error
 */
export const safeParseFields = (fields) => {
  try {
    if (typeof fields === 'string') {
      return JSON.parse(fields || '[]');
    }
    if (Array.isArray(fields)) {
      return fields;
    }
    return [];
  } catch (error) {
    console.error('Error parsing jenis_surat fields:', error);
    return [];
  }
};

/**
 * Safely stringify data for display (handles both string and object)
 * @param {string|object} data - Data to stringify
 * @param {number} indent - Indentation level (default 2)
 * @returns {string} Formatted JSON string
 */
export const safeStringifyData = (data, indent = 2) => {
  try {
    if (typeof data === 'string') {
      // Try to parse and re-stringify for formatting
      const parsed = JSON.parse(data || '{}');
      return JSON.stringify(parsed, null, indent);
    }
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, indent);
    }
    return '{}';
  } catch (error) {
    console.error('Error stringifying data:', error);
    return '{}';
  }
};
