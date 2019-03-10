const _ = require('lodash');
const chalk = require('chalk');
const columnify = require('columnify');

const { writeShellRc, writeJsonRc, writeInitRc } = require('./write');
const promptUser = require('./prompts');

const {
  green,
  greenBright,
  cyan,
  red,
  whiteBright
} = chalk;

/* eslint-disable no-console */
const removeDefinition = (name) => {
  console.log(`${green('Remove Definition')} ${cyan(name)}`);
};

const checkAliases = (aliases, existing) => {
  aliases.split(',').forEach(alias => {
    if (existing.indexOf(alias) !== -1) {
      console.log(`\n${red('ERROR:')} alias ${alias} already exists`);
      throw new Error('AliasExists');
    }
  });
};

const parseTypeArg = (typeArg) => {
  let type = 'All';

  if ([
    'runCommands',
    'runCommand',
    'command',
    'commands'
  ].indexOf(typeArg) !== -1) {
    type = 'runCommands';
  } else if ([
    'tmux',
    'tmuxcommands',
    'tmuxcommand'
  ].indexOf(typeArg) !== -1) {
    type = 'tmuxCommands';
  } else if ([
    'directories',
    'directory'
  ].indexOf(typeArg) !== -1) {
    type = 'directories';
  }
  return type;
};

const addDefinition = (options, gorc, type) => {
  // console.log(`${green('Add Definition')} ${cyan(type)}`);
  const { directories } = gorc;
  const { shellFilePath, jsonFilePath } = options;

  const newGoRc = _.cloneDeep(gorc);
  promptUser(type, (err, newDefinition) => {
    const { aliases, directory } = newDefinition;

    if (type === 'directories') {
      const existingAliases = _.map(
        _.keys(directories), dir => directories[dir]
      );
      _.merge(newDefinition, { aliases: aliases.split(',') });
      checkAliases(aliases, existingAliases);
      newGoRc.directories[directory] = newDefinition.aliases;
    } else {
      const existingAliases = _.map(newGoRc[type], 'aliases');
      _.merge(newDefinition, { aliases: aliases.split(',') });
      checkAliases(aliases, existingAliases);
      newGoRc[type].push(newDefinition);
    }

    writeShellRc(newGoRc, shellFilePath);
    writeJsonRc(newGoRc, jsonFilePath);
  });
};

const listDefinitions = (options, gorc, typeArg) => {
  const type = parseTypeArg(typeArg);

  const definitions = _.has(gorc, type)
    ? { [type] : _.get(gorc, type) }
    : gorc;

  const { directories, runCommands, tmuxCommands } = definitions;

  const columnOptions = {
    // config: { directory: maxWidth: 60 } }
    columnSplitter: '    ',
    // maxWidth: 60,
    maxLineLWidth: 'auto',
    headingTransform: (heading) => whiteBright(heading),
    showHeaders: false,
    config: {
      aliases: {
        dataTransform: (data) => data.split(',')
          .sort((a, b) => a.length - b.length)
          .map(alias => cyan(alias))
          .join(whiteBright(' | '))
      }
    }
  };

  const directoryMap = _.map(_.keys(directories), dir => ({
    directory: dir,
    aliases: directories[dir]
  }));

  // console.log(
  //   `\nListing Go Definitions: ${green(type)}`
  // );

  if (directoryMap.length > 0) {
    console.log(`${greenBright('\nDirectories')}\n--------`);
    console.log(columnify(directoryMap, _.cloneDeep(columnOptions)));
  }

  if (runCommands && runCommands.length > 0) {
    console.log(`${greenBright('\nRun Commands')}\n------------`);
    console.log(columnify(runCommands, _.cloneDeep(columnOptions)));
  }

  if (tmuxCommands && tmuxCommands.length > 0) {
    console.log(`${greenBright('\nTmux Commands')}\n-------------`);
    console.log(columnify(tmuxCommands, columnOptions));
  }
};

module.exports = {
  initialize: writeInitRc,
  listDefinitions,
  addDefinition,
  removeDefinition
};
