const { mapScalar } = require('./utils.js');

/**
 * Parse Prisma models into TypeScript interfaces
 * @param {string} schema - Cleaned schema content
 * @param {Set} enums - Set of enum names
 * @param {Set} models - Set of model names
 * @param {object} options - Parsing options
 * @returns {string[]} Array of interface declarations
 */
function parseModels(schema, enums, models, options = {}) {
  const { docs = true } = options;
  const out = [];
  const modelRegex = /model\s+(\w+)\s*{([\s\S]*?)}\s*/g;
  let m;
  
  while ((m = modelRegex.exec(schema))) {
    const name = m[1];
    const block = m[2];
    const fields = [];
    
    block.split(/\n|\r/).forEach((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) return;
      
      const commentMatch = line.match(/\/\/\s*(.*)$/);
      const comment = commentMatch ? commentMatch[1].trim() : null;
      const cleaned = line.replace(/\s*\/\/.*$/, '').trim();
      if (!cleaned) return;
      
      const [fieldName, typeToken] = cleaned.split(/\s+/);
      if (!fieldName || !typeToken || fieldName.startsWith('@')) return;
      
      let isArr = false;
      let isOpt = false;
      let base = typeToken;
      
      if (base.endsWith('[]')) {
        isArr = true;
        base = base.slice(0, -2);
      }
      if (base.endsWith('?')) {
        isOpt = true;
        base = base.slice(0, -1);
      }
      
      const tsTypeRaw = mapScalar(base);
      const isEnum = enums.has(base);
      const isRef = models.has(base) && !isEnum && 
        !['string', 'number', 'boolean', 'Date', 'bigint', 'JsonValue'].includes(tsTypeRaw);
      
      let tsType = isRef || isEnum ? base : tsTypeRaw;
      if (isArr) tsType += '[]';
      if (isOpt && !isArr) tsType += ' | null';
      
      const optToken = isOpt ? '?' : '';
      const doc = docs && comment ? `  /** ${comment} */\n` : '';
      
      fields.push(`${doc}  ${fieldName}${optToken}: ${tsType};`);
    });
    
    out.push(`export interface ${name} {\n${fields.join('\n')}\n}`);
  }
  
  return out;
}

module.exports = {
  parseModels
};
