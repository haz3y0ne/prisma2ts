# prisma2ts

[![npm version](https://img.shields.io/npm/v/prisma2ts.svg)](https://www.npmjs.com/package/prisma2ts)
[![npm downloads](https://img.shields.io/npm/dw/prisma2ts.svg)](https://www.npmjs.com/package/prisma2ts)
[![npm downloads](https://img.shields.io/npm/dt/prisma2ts.svg)](https://www.npmjs.com/package/prisma2ts)
[![license](https://img.shields.io/npm/l/prisma2ts.svg)](https://github.com/haz3y0ne/prisma2ts/blob/master/LICENSE)

A CLI tool that converts Prisma schema files into TypeScript interface/type declarations with inline JSDoc comments.

## Installation

```bash
npm install -g prisma2ts
```

Or run directly with npx:

```bash
npx prisma2ts --input schema.prisma
```

## Usage

```bash
prisma2ts [options]
```

### Options

- `-i, --input <file>` - Input Prisma schema file (default: `schema.prisma`)
- `-o, --output <file>` - Output TypeScript file (prints to stdout if not specified)
- `--no-docs` - Disable JSDoc comment generation
- `--table` - Print summary table of parsed models and enums
- `--json` - Output JSON representation instead of TypeScript
- `-V, --version` - Display version number
- `-h, --help` - Display help information

### Examples

Basic usage:

```bash
prisma2ts --input schema.prisma --output types.ts
```

Generate without JSDoc comments:

```bash
prisma2ts --input schema.prisma --no-docs
```

Show summary table:

```bash
prisma2ts --input schema.prisma --table
```

Output as JSON:

```bash
prisma2ts --input schema.prisma --json
```

## Features

- **Enum Conversion**: Converts Prisma enums to TypeScript union types
- **Model Conversion**: Converts Prisma models to TypeScript interfaces
- **JSDoc Generation**: Preserves `//` comments as JSDoc annotations
- **Type Mapping**: Maps Prisma types to appropriate TypeScript types
- **JSON Support**: Includes JsonValue type alias when needed
- **Clean Output**: Strips generator/datasource blocks and block comments

## Type Mappings

| Prisma Type | TypeScript Type |
| ----------- | --------------- |
| `String`    | `string`        |
| `Int`       | `number`        |
| `Float`     | `number`        |
| `Boolean`   | `boolean`       |
| `DateTime`  | `Date`          |
| `Json`      | `JsonValue`     |
| `BigInt`    | `bigint`        |
| `Bytes`     | `string`        |

## Example

**Input (schema.prisma):**

```prisma
enum Role {
  USER     // Standard user
  ADMIN    // Administrator
}

model User {
  id    String @id
  email String @unique
  name  String? // Display name
  role  Role    @default(USER)
}
```

**Output (TypeScript):**

```typescript
export type Role =
  /** Standard user */
  | "USER"
  /** Administrator */
  | "ADMIN";

export interface User {
  id: string;
  email: string;
  /** Display name */
  name?: string | null;
  role: Role;
}
```

## License

MIT
