const Table = require('cli-table3');
const chalk = require('chalk');

/**
 * Create a summary table showing parsed models and enums
 * @param {object} stats - Statistics object with enums and models count
 * @returns {string} Formatted table string
 */
function createSummaryTable(stats) {
  const table = new Table({
    head: [chalk.cyan('Type'), chalk.cyan('Count')],
    chars: {
      'top': '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      'bottom': '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      'left': '│',
      'left-mid': '├',
      'mid': '─',
      'mid-mid': '┼',
      'right': '│',
      'right-mid': '┤',
      'middle': '│'
    },
    style: {
      head: [],
      border: ['grey']
    }
  });

  table.push(
    ['Enums', chalk.green(stats.enums.toString())],
    ['Models', chalk.green(stats.models.toString())],
    ['Total', chalk.yellow((stats.enums + stats.models).toString())]
  );

  return table.toString();
}

module.exports = {
  createSummaryTable
};
