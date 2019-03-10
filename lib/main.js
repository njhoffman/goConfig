const os = require('os');
const path = require('path');
const yargs = require('yargs');

const {
  initialize,
  addDefinition,
  removeDefinition,
  listDefinitions
} = require('./commands');

const options = {
  shellFilePath: path.join(os.homedir(), '.gorc'),
  jsonFilePath: path.join(os.homedir(), '.gorc.json')
};

/* eslint-disable import/no-dynamic-require, global-require, no-console */
let gorcJson = {};
try {
  gorcJson = require(path.resolve(options.jsonFilePath));
} catch (e) {
  console.log(e);
}
/* eslint-enable import/no-dynamic-require, global-require, no-console */

const parseArguments = () => (
  yargs
    .usage('Usage: $0 <command> [options]')
    .command({
      command: 'init <type>',
      desc: 'Initialize a GO resource file from a saved template',
      aliases: ['initialize', 'init', 'i'],
      handler: ({ type }) => initialize(options, type)
    })
    .command({
      command: 'add <type>',
      desc: 'Create a new GO directory/command definiition',
      aliases: ['add', 'a', 'create', 'c'],
      handler: ({ type }) => addDefinition(options, gorcJson, type)
    })
    .command({
      command: 'remove <type>',
      desc: 'Remove a GO directory/command definition',
      aliases: ['remove', 'r', 'delete', 'd'],
      handler: ({ type }) => removeDefinition(options, gorcJson, type)
    })
    .command({
      command: ['list [type]', '$0'],
      builder: yarg => yarg.option('type', {
        default: 'All'
      }),
      desc: 'List Definitions',
      aliases: ['list', 'l', '$0'],
      handler: ({ type }) => listDefinitions(options, gorcJson, type)
    })
    .help('h')
    .alias('h', 'help')
    .argv
);

parseArguments();
