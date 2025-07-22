#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { convertSchema } = require('../src/index.js');

program
  .name('prisma2ts')
  .description('Convert Prisma schema files into TypeScript interface/type declarations')
  .version('1.0.0');

program
  .option('-i, --input <file>', 'input Prisma schema file', 'schema.prisma')
  .option('-o, --output <file>', 'output TypeScript file (or stdout if not specified)')
  .option('--no-docs', 'disable JSDoc comment generation')
  .option('--table', 'print summary table of parsed models and enums')
  .option('--json', 'output JSON representation instead of TypeScript')
  .parse();

const options = program.opts();

async function main() {
  try {
    // Resolve input file path
    const inputPath = path.resolve(options.input);
    
    if (!fs.existsSync(inputPath)) {
      console.error(chalk.red(`Error: Input file not found: ${inputPath}`));
      process.exit(1);
    }

    // Read schema file
    const schemaContent = fs.readFileSync(inputPath, 'utf8');
    
    // Convert schema
    const result = convertSchema(schemaContent, {
      docs: options.docs,
      table: options.table,
      json: options.json
    });

    // Output results
    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, result.output);
      console.log(chalk.green(`✓ Generated types written to: ${outputPath}`));
    } else {
      console.log(result.output);
    }

    // Show summary table if requested
    if (options.table && result.summary) {
      console.log('\n' + result.summary);
    }

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main();
