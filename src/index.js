const { generateTypes } = require('./parser/generateTypes.js');
const { createSummaryTable } = require('../utils/table.js');
const { log } = require('../utils/logger.js');

/**
 * Main entry point for schema conversion
 * @param {string} schemaContent - Raw Prisma schema content
 * @param {object} options - Conversion options
 * @returns {object} Result with output and summary
 */
function convertSchema(schemaContent, options = {}) {
  const { docs = true, table = false, json = false } = options;
  
  log.info('Parsing Prisma schema...');
  
  const result = generateTypes(schemaContent, { docs, json });
  
  let summary = null;
  if (table) {
    summary = createSummaryTable(result.stats);
  }
  
  log.success(`Generated ${result.stats.enums} enums and ${result.stats.models} models`);
  
  return {
    output: result.output,
    summary,
    stats: result.stats
  };
}

module.exports = {
  convertSchema
};
