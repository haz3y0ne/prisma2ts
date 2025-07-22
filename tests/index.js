const { convertSchema } = require('../src/index.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(chalk.blue('🧪 Running prisma2ts tests...\n'));

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(chalk.green('✓'), chalk.gray(name));
        this.passed++;
      } catch (error) {
        console.log(chalk.red('✗'), chalk.gray(name));
        console.log(chalk.red(`  Error: ${error.message}`));
        this.failed++;
      }
    }

    console.log();
    if (this.failed === 0) {
      console.log(chalk.green(`🎉 All ${this.passed} tests passed!`));
    } else {
      console.log(chalk.red(`❌ ${this.failed} tests failed, ${this.passed} passed`));
      process.exit(1);
    }
  }
}

// Helper to load test schema
function loadSchema(filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), 'utf8');
}

// Test runner instance
const runner = new TestRunner();

// Basic conversion tests
runner.test('Basic enum and model conversion', () => {
  const schema = loadSchema('simple.prisma');
  const result = convertSchema(schema);
  
  if (!result.output.includes('export type Role =')) {
    throw new Error('Should generate Role enum');
  }
  if (!result.output.includes('export interface User {')) {
    throw new Error('Should generate User interface');
  }
  if (result.stats.enums !== 1 || result.stats.models !== 1) {
    throw new Error(`Expected 1 enum and 1 model, got ${result.stats.enums} enums and ${result.stats.models} models`);
  }
});

runner.test('JSDoc comment preservation', () => {
  const schema = loadSchema('simple.prisma');
  const result = convertSchema(schema, { docs: true });
  
  if (!result.output.includes('/** Standard user */')) {
    throw new Error('Should preserve enum comments as JSDoc');
  }
  if (!result.output.includes('/** Display name */')) {
    throw new Error('Should preserve field comments as JSDoc');
  }
});

runner.test('JSDoc disabled option', () => {
  const schema = loadSchema('simple.prisma');
  const result = convertSchema(schema, { docs: false });
  
  if (result.output.includes('/** Standard user */')) {
    throw new Error('Should not include JSDoc when disabled');
  }
});

runner.test('JSON output format', () => {
  const schema = loadSchema('minimal.prisma');
  const result = convertSchema(schema, { json: true });
  
  const parsed = JSON.parse(result.output);
  if (!parsed.enums || !parsed.models || !parsed.stats) {
    throw new Error('JSON output should have enums, models, and stats');
  }
});

runner.test('JsonValue alias injection', () => {
  const schema = loadSchema('simple.prisma');
  const result = convertSchema(schema);
  
  if (!result.output.includes('export type JsonValue =')) {
    throw new Error('Should include JsonValue alias when Json type is used');
  }
});

runner.test('No JsonValue alias when not needed', () => {
  const schema = loadSchema('minimal.prisma');
  const result = convertSchema(schema);
  
  if (result.output.includes('JsonValue')) {
    throw new Error('Should not include JsonValue alias when not needed');
  }
});

runner.test('Complex schema parsing', () => {
  const schema = loadSchema('sample.prisma');
  const result = convertSchema(schema);
  
  if (result.stats.enums !== 2 || result.stats.models !== 4) {
    throw new Error(`Expected 2 enums and 4 models, got ${result.stats.enums} enums and ${result.stats.models} models`);
  }
});

runner.test('Optional and array field handling', () => {
  const schema = loadSchema('sample.prisma');
  const result = convertSchema(schema);
  
  if (!result.output.includes('name?: string | null')) {
    throw new Error('Should handle optional fields correctly');
  }
  if (!result.output.includes('posts: Post[]')) {
    throw new Error('Should handle array fields correctly');
  }
  if (!result.output.includes('tags: string[]')) {
    throw new Error('Should handle scalar array fields correctly');
  }
});

// Run all tests
runner.run().catch(console.error);
