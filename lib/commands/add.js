const _ = require('lodash');
const { red } = require('chalk');

const promptUser = require('../prompts');
const { writeShellRc, writeJsonRc } = require('../write');

const checkAliases = (aliases, existing) => {
  aliases.split(',').forEach((alias) => {
    if (existing.indexOf(alias) !== -1) {
      console.log(`\n${red('ERROR:')} alias ${alias} already exists`);
      throw new Error('AliasExists');
    }
  });
};

const addDefinition = (options, gotorc, type) => {
  console.log(`${green('Add Definition')} ${cyan(type)}`);
  const { directories } = gotorc;
  const { shellFilePath, jsonFilePath } = options;

  const newGotoRc = _.cloneDeep(gotorc);
  promptUser(type, (err, newDefinition) => {
    const { aliases, directory } = newDefinition;
    if (type === 'directories') {
      const existingAliases = _.map(_.keys(directories), (dir) => directories[dir]);
      _.merge(newDefinition, { aliases: aliases.split(',') });
      checkAliases(aliases, existingAliases);
      newGotoRc.directories[directory] = newDefinition.aliases;
    } else {
      const existingAliases = _.map(newGotoRc[type], 'aliases');
      _.merge(newDefinition, { aliases: aliases.split(',') });
      checkAliases(aliases, existingAliases);
      newGotoRc[type].push(newDefinition);
    }

    writeShellRc(newGotoRc, shellFilePath);
    writeJsonRc(newGotoRc, jsonFilePath);
  });
};

module.exports = addDefinition;
