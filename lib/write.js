const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const { cyan, bold, red } = chalk;

/* eslint-disable no-console */

const writeJsonRc = (gotoDefs, fileName) => {
  console.log(`${bold('Writing JSON File: ')} ${cyan(fileName)}`);
  fs.writeFileSync(path.resolve(fileName), JSON.stringify(gotoDefs, null, '\t'), 'utf8');
};

const writeShellRc = (gotoDefs, fileName) => {
  const { directories, runCommands, tmuxCommands } = gotoDefs;

  console.log(`${bold('Writing Shell File: ')} ${cyan(fileName)}`);

  const rcOut = [
    '#!/bin/bash',
    '# GOTO definitions, generated automatically',
    '',
    'declare -A _GOTO_DIR',
    'declare -A _GOTO_RUN',
    'declare -A _GOTO_TMUX',
    ''
  ];

  rcOut.push('export _GOTO_DIR=(');
  _.keys(directories).forEach(dir => directories[dir].forEach(alias => rcOut.push(`  ${alias} "${dir}"`)));
  rcOut.push(')', '');

  rcOut.push('export _GOTO_RUN=(');
  runCommands.forEach(rc =>
    rc.aliases.forEach(alias =>
      rcOut.push(
        rc.directory.trim().length > 0
          ? `  ${alias.trim()} "cd ${rc.directory.trim()} && ${rc.command.trim()}"`
          : `  ${alias.trim()} "${rc.command.trim()}"`
      )
    )
  );
  rcOut.push(')', '');

  rcOut.push('export _GOTO_TMUX=(');
  tmuxCommands.forEach(tc => tc.aliases.forEach(alias => rcOut.push(`  ${alias} "${tc.command.trim()}"`)));
  rcOut.push(')');

  return fs.writeFileSync(path.resolve(fileName), rcOut.join('\n'), 'utf8');
};

const writeInitRc = (options, name) => {
  const { jsonFilePath, shellFilePath } = options;
  const sourceFile = path.join(__dirname, '..', 'definitions', `${name}.json`);
  if (fs.existsSync(sourceFile)) {
    const gotoJson = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    writeShellRc(gotoJson, shellFilePath);
    writeJsonRc(gotoJson, jsonFilePath);
  } else {
    console.log(`${red('ERROR:')} Source file "${sourceFile}" does not exist`);
  }
};

/* eslint-disable no-console */

module.exports = { writeShellRc, writeJsonRc, writeInitRc };
