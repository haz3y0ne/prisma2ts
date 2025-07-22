/**
 * Parse Prisma enums into TypeScript union types
 * @param {string} schema - Cleaned schema content
 * @param {object} options - Parsing options
 * @returns {string[]} Array of enum declarations
 */
function parseEnums(schema, options = {}) {
  const { docs = true } = options;
  const out = [];
  const enumRegex = /enum\s+(\w+)\s*{([\s\S]*?)}\s*/g;
  let m;
  
  while ((m = enumRegex.exec(schema))) {
    const name = m[1];
    const block = m[2];
    const members = [];
    
    block.split(/\n|\r/).forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      
      const [, ident, comment] = line.match(/^(\w+)(?:\s*\/\/\s*(.*))?$/) || [];
      if (!ident) return;
      
      members.push({ ident, comment });
    });
    
    if (!members.length) continue;
    
    const unionLines = members.map(({ ident, comment }) => {
      if (docs && comment) {
        return `  /** ${comment} */\n  | "${ident}"`;
      }
      return `  | "${ident}"`;
    });
    
    // Remove leading pipe from first line
    unionLines[0] = unionLines[0].replace(/^\s*\|\s*/, '  ');
    
    out.push(`export type ${name} =\n${unionLines.join('\n')};`);
  }
  
  return out;
}

module.exports = {
  parseEnums
};
