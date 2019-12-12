const os = require('os');
const path = require('path');
const yargs = require('yargs');

const { initialize, addDefinition, removeDefinition, listDefinitions } = require('./commands');

const options = {
  shellFilePath: path.join(os.homedir(), '.gotorc'),
  jsonFilePath: path.join(os.homedir(), '.gotorc.json')
};

let gotorcJson = {};

const parseArguments = () =>
  yargs
    .usage('Usage: $0 <command> [options]')
    .command({
      command: 'init <type>',
      desc: 'Initialize a GOTO resource file from a saved template',
      aliases: ['initialize', 'init', 'i'],
      handler: ({ type }) => initialize(options, type)
    })
    .command({
      command: 'add <type>',
      desc: 'Create a new GOTO directory/command definiition',
      aliases: ['add', 'a', 'create', 'c'],
      handler: ({ type }) => addDefinition(options, gotorcJson, type)
    })
    .command({
      command: 'remove <type>',
      desc: 'Remove a GOTO directory/command definition',
      aliases: ['remove', 'r', 'delete', 'd'],
      handler: ({ type }) => removeDefinition(options, gotorcJson, type)
    })
    .command({
      command: ['list [type]', '$0'],
      builder: yarg =>
        yarg.option('type', {
          default: 'All'
        }),
      desc: 'List Definitions',
      aliases: ['list', 'l', '$0'],
      handler: ({ type }) => listDefinitions(options, gotorcJson, type)
    })
    .help('h')
    .alias('h', 'help').argv;

/* eslint-disable import/no-dynamic-require, global-require, no-console */
try {
  gotorcJson = require(path.resolve(options.jsonFilePath));
} catch (e) {
  console.log(e);
}
/* eslint-enable import/no-dynamic-require, global-require, no-console */

parseArguments();
