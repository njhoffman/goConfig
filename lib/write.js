const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const { cyan, bold, red } = chalk;

/* eslint-disable no-console */

const writeJsonRc = (goDefs, fileName) => {
  console.log(`${bold('Writing JSON File: ')} ${cyan(fileName)}`);
  fs.writeFileSync(
    path.resolve(fileName),
    JSON.stringify(goDefs, null, '\t'), 'utf8'
  );
};

const writeShellRc = (goDefs, fileName) => {
  const { directories, runCommands, tmuxCommands } = goDefs;

  console.log(`${bold('Writing Shell File: ')} ${cyan(fileName)}`);

  const rcOut = [
    '#!/bin/bash',
    '# GO definitions, generated automatically',
    '',
    'declare -A _GO_DIR',
    'declare -A _GO_RUN',
    'declare -A _GO_TMUX',
    ''
  ];

  rcOut.push('export _GO_DIR=(');
  _.keys(directories).forEach(dir => (
    directories[dir].forEach(alias => (
      rcOut.push(`  ${alias} "${dir}"`)
    ))
  ));
  rcOut.push(')', '');

  rcOut.push('export _GO_RUN=(');
  runCommands.forEach(rc => (
    rc.aliases.forEach(alias => (
      rcOut.push(
        rc.directory.trim().length > 0
          ? `  ${alias.trim()} "cd ${rc.directory.trim()} && ${rc.command.trim()}"`
          : `  ${alias.trim()} "${rc.command.trim()}"`
      )
    ))
  ));
  rcOut.push(')', '');


  rcOut.push('export _GO_TMUX=(');
  tmuxCommands.forEach(tc => (
    tc.aliases.forEach(alias => (
      rcOut.push(`  ${alias} "${tc.directory}"`)
    ))
  ));
  rcOut.push(')');

  return fs.writeFileSync(
    path.resolve(fileName),
    rcOut.join('\n'),
    'utf8'
  );
};

const writeInitRc = (options, name) => {
  const { jsonFilePath, shellFilePath } = options;
  const sourceFile = path.join(__dirname, '..', 'definitions', `${name}.json`);
  if (fs.existsSync(sourceFile)) {
    const goJson = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    writeShellRc(goJson, shellFilePath);
    writeJsonRc(goJson, jsonFilePath);
  } else {
    console.log(`${red('ERROR:')} Source file "${sourceFile}" does not exist`);
  }
};

/* eslint-disable no-console */

module.exports = { writeShellRc, writeJsonRc, writeInitRc };
