const _ = require('lodash');
const chalk = require('chalk');
const columnify = require('columnify');

const { writeShellRc, writeJsonRc, writeInitRc } = require('./write');
const promptUser = require('./prompts');

const { green, greenBright, cyan, red, whiteBright } = chalk;

/* eslint-disable no-console */
const removeDefinition = name => {
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

const parseTypeArg = typeArg => {
  let type = 'All';

  if (['runCommands', 'runCommand'].indexOf(typeArg) !== -1) {
    type = 'runCommands';
  } else if (['tmux', 'tmuxCommands', 'tmuxCommand'].indexOf(typeArg) !== -1) {
    type = 'tmuxCommands';
  } else if (['directories', 'directory'].indexOf(typeArg) !== -1) {
    type = 'directories';
  }
  return type;
};

const addDefinition = (options, gotorc, type) => {
  // console.log(`${green('Add Definition')} ${cyan(type)}`);
  const { directories } = gotorc;
  const { shellFilePath, jsonFilePath } = options;

  const newGotoRc = _.cloneDeep(gotorc);
  promptUser(type, (err, newDefinition) => {
    const { aliases, directory } = newDefinition;

    if (type === 'directories') {
      const existingAliases = _.map(_.keys(directories), dir => directories[dir]);
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

const listDefinitions = (options, gotorc, typeArg) => {
  const type = parseTypeArg(typeArg);

  const definitions = _.has(gotorc, type) ? { [type]: _.get(gotorc, type) } : gotorc;

  const { directories, runCommands, tmuxCommands } = definitions;

  const columnOptions = {
    // config: { directory: maxWidth: 60 } }
    // maxWidth: 60,
    // maxLineWidth: 'auto',
    // TODO: fork columnify to strip escape sequences when calculating maxLine
    columnSplitter: '    ',
    headingTransform: heading => whiteBright(heading),
    showHeaders: false,
    config: {
      directory: {
        dataTransform: data => data.replace('/home/$USER', '~').replace('$HOME', '~')
      },
      aliases: {
        dataTransform: data =>
          data
            .split(',')
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

  if (directoryMap.length > 0) {
    console.log(`${greenBright('\nDirectories')}\n--------`);
    console.log(columnify(directoryMap, { ...columnOptions }));
  }

  if (runCommands && runCommands.length > 0) {
    console.log(`${greenBright('\nRun Commands')}\n------------`);
    console.log(
      columnify(runCommands, {
        ...columnOptions,
        columns: ['name', 'aliases']
      })
    );
  }

  if (tmuxCommands && tmuxCommands.length > 0) {
    console.log(`${greenBright('\nTmux Commands')}\n-------------`);
    console.log(
      columnify(tmuxCommands, {
        ...columnOptions,
        columns: ['name', 'aliases']
      })
    );
  }
};

module.exports = {
  initialize: writeInitRc,
  listDefinitions,
  addDefinition,
  removeDefinition
};
