const _ = require('lodash');
const columnify = require('columnify');
const termSize = require('term-size');
const { greenBright, cyan, whiteBright } = require('chalk');

const { columns } = termSize();

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

const trimLines = lines => {
  const longestAlias = lines.reduce((acc, curr) => {
    const len = curr.aliases.join(' | ').length;
    return len > acc ? len : acc;
  }, 0);

  return lines.map(({ aliases, directory }) => {
    const trimSize = columns - longestAlias - 3;
    const trimmedDirectory = `${directory.slice(0, trimSize)}${directory.length > trimSize ? '...' : ''}`;
    return {
      aliases,
      directory: trimmedDirectory
    };
  });
};

const listDefinitions = (options, gotorc, typeArg) => {
  const type = parseTypeArg(typeArg);

  const definitions = _.has(gotorc, type) ? { [type]: _.get(gotorc, type) } : gotorc;

  const { directories, runCommands, tmuxCommands } = definitions;

  const directoryMap = _.map(_.keys(directories), dir => ({
    aliases: directories[dir],
    directory: dir
  }));

  if (directoryMap.length > 0) {
    console.log(`${greenBright('\nDirectories')}\n--------`);
    console.log(columnify(trimLines(directoryMap), { ...columnOptions }));
  }

  if (runCommands && runCommands.length > 0) {
    console.log(`${greenBright('\nRun Commands')}\n------------`);
    console.log(
      columnify(runCommands, {
        ...columnOptions,
        columns: ['aliases', 'name']
      })
    );
  }

  if (tmuxCommands && tmuxCommands.length > 0) {
    console.log(`${greenBright('\nTmux Commands')}\n-------------`);
    console.log(
      columnify(tmuxCommands, {
        ...columnOptions,
        columns: ['aliases', 'name']
      })
    );
  }
};

module.exports = listDefinitions;
