/**
 * Strip only block comments - keep line comments for JSDoc conversion
 * @param {string} s - Input string
 * @returns {string} String with block comments removed
 */
const stripBlockComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * JSON type alias declarations
 */
const JSON_ALIAS_DECL = 
  'export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;\n' +
  'export interface JsonObject { [key: string]: JsonValue }\n' +
  'export interface JsonArray extends Array<JsonValue> {}\n';

/**
 * Map Prisma scalar types to TypeScript types
 * @param {string} prismaType - Prisma type name
 * @returns {string} TypeScript type name
 */
function mapScalar(prismaType) {
  switch (prismaType) {
    case 'String':
    case 'Bytes':
      return 'string';
    case 'Int':
    case 'Float':
    case 'Decimal':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'DateTime':
      return 'Date';
    case 'BigInt':
      return 'bigint';
    case 'Json':
      return 'JsonValue';
    default:
      return prismaType;
  }
}

module.exports = {
  stripBlockComments,
  JSON_ALIAS_DECL,
  mapScalar
};
