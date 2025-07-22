const chalk = require('chalk');

/**
 * Logger utility with colored output
 */
const log = {
  info: (message) => console.log(chalk.blue('ℹ'), message),
  success: (message) => console.log(chalk.green('✓'), message),
  warn: (message) => console.log(chalk.yellow('⚠'), message),
  error: (message) => console.log(chalk.red('✗'), message)
};

module.exports = {
  log
};
