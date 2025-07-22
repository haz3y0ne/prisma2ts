const { parseEnums } = require('./parseEnums.js');
const { parseModels } = require('./parseModels.js');
const { stripBlockComments, JSON_ALIAS_DECL } = require('./utils.js');

/**
 * Main type generation coordinator
 * @param {string} prismaSchema - Raw Prisma schema content
 * @param {object} options - Generation options
 * @returns {object} Generated output and statistics
 */
function generateTypes(prismaSchema, options = {}) {
  const { docs = true, json = false } = options;
  
  // Strip block comments and clean up schema
  let src = stripBlockComments(prismaSchema);
  src = src.replace(/(generator|datasource)\s+\w+\s*{[\s\S]*?}/g, '');
  
  // Extract enum and model names for reference checking
  const enumSet = new Set();
  const modelSet = new Set();
  
  (src.match(/enum\s+(\w+)/g) || []).forEach((s) =>
    enumSet.add(s.split(/\s+/)[1])
  );
  (src.match(/model\s+(\w+)/g) || []).forEach((s) =>
    modelSet.add(s.split(/\s+/)[1])
  );
  
  // Parse enums and models
  const enumsResult = parseEnums(src, { docs });
  const modelsResult = parseModels(src, enumSet, modelSet, { docs });
  
  const stats = {
    enums: enumsResult.length,
    models: modelsResult.length
  };
  
  if (json) {
    return {
      output: JSON.stringify({
        enums: enumsResult,
        models: modelsResult,
        stats
      }, null, 2),
      stats
    };
  }
  
  // Combine outputs
  const body = [...enumsResult, ...modelsResult].join('\n\n');
  
  // Prepend JsonValue alias only if used
  const needsJsonAlias = body.includes('JsonValue');
  const output = needsJsonAlias ? `${JSON_ALIAS_DECL}\n${body}` : body;
  
  return {
    output,
    stats
  };
}

module.exports = {
  generateTypes
};
