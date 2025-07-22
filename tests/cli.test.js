#!/usr/bin/env node

// CLI integration tests
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const CLI_PATH = path.join(__dirname, '../bin/cli.js');
const FIXTURE_PATH = path.join(__dirname, 'fixtures/simple.prisma');

class CLITestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  async runCLI(args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [CLI_PATH, ...args], {
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', reject);
    });
  }

  async test(name, testFn) {
    try {
      await testFn();
      console.log(chalk.green('✓'), chalk.gray(name));
      this.passed++;
    } catch (error) {
      console.log(chalk.red('✗'), chalk.gray(name));
      console.log(chalk.red(`  Error: ${error.message}`));
      this.failed++;
    }
  }

  async runAll() {
    console.log(chalk.blue('🧪 Running CLI integration tests...\n'));

    await this.test('CLI version flag', async () => {
      const result = await this.runCLI(['--version']);
      if (result.code !== 0 || !result.stdout.includes('1.0.0')) {
        throw new Error('Version command failed');
      }
    });

    await this.test('CLI help flag', async () => {
      const result = await this.runCLI(['--help']);
      if (result.code !== 0 || !result.stdout.includes('Usage:')) {
        throw new Error('Help command failed');
      }
    });

    await this.test('Basic schema conversion', async () => {
      const result = await this.runCLI(['--input', FIXTURE_PATH]);
      if (result.code !== 0 || !result.stdout.includes('export type Role')) {
        throw new Error('Basic conversion failed');
      }
    });

    await this.test('Table output option', async () => {
      const result = await this.runCLI(['--input', FIXTURE_PATH, '--table']);
      if (result.code !== 0 || !result.stdout.includes('┌───')) {
        throw new Error('Table output failed');
      }
    });

    await this.test('JSON output option', async () => {
      const result = await this.runCLI(['--input', FIXTURE_PATH, '--json']);
      if (result.code !== 0) {
        throw new Error('JSON output failed');
      }
      try {
        JSON.parse(result.stdout.split('\n').slice(2).join('\n'));
      } catch {
        throw new Error('Invalid JSON output');
      }
    });

    await this.test('File output option', async () => {
      const outputFile = path.join(__dirname, 'temp-output.ts');
      const result = await this.runCLI(['--input', FIXTURE_PATH, '--output', outputFile]);
      
      if (result.code !== 0) {
        throw new Error('File output failed');
      }
      
      if (!fs.existsSync(outputFile)) {
        throw new Error('Output file was not created');
      }
      
      const content = fs.readFileSync(outputFile, 'utf8');
      if (!content.includes('export type Role')) {
        throw new Error('Output file content is incorrect');
      }
      
      // Cleanup
      fs.unlinkSync(outputFile);
    });

    await this.test('Invalid input file', async () => {
      const result = await this.runCLI(['--input', 'nonexistent.prisma']);
      if (result.code === 0) {
        throw new Error('Should fail with non-existent input file');
      }
    });

    console.log();
    if (this.failed === 0) {
      console.log(chalk.green(`🎉 All ${this.passed} CLI tests passed!`));
    } else {
      console.log(chalk.red(`❌ ${this.failed} CLI tests failed, ${this.passed} passed`));
      process.exit(1);
    }
  }
}

const cliRunner = new CLITestRunner();
cliRunner.runAll().catch(console.error);
