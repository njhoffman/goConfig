const { green, cyan } = require('chalk');

const { writeInitRc } = require('./write');
const listDefinitions = require('./commands/list');
const addDefinition = require('./commands/add');

/* eslint-disable no-console */
const removeDefinition = name => {
  console.log(`${green('Remove Definition')} ${cyan(name)}`);
};

module.exports = {
  initialize: writeInitRc,
  listDefinitions,
  addDefinition,
  removeDefinition
};
