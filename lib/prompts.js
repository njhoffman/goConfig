const prompt = require('prompt');
const chalk = require('chalk');

const { cyan, whiteBright } = chalk;

const fmtDesc = text => `${whiteBright(text)} `;

const props = {
  directories: {
    directory: {
      description: fmtDesc('Enter the directory'),
      required: true
    },
    aliases: {
      description: fmtDesc('Enter comma-separated aliases'),
      required: true
    }
  },
  runCommands: {
    name: {
      description: fmtDesc('Enter the name of the command'),
      required: true,
      message: 'Modtets Api Dev'
    },
    command: {
      description: fmtDesc('Enter the command to run'),
      required: true,
      message: 'npm run dev | debugger256'
    },
    aliases: {
      description: fmtDesc('Enter comma-separated aliases'),
      required: true,
      message: 'mt-api, modteets-api'
    },
    directory: {
      description: fmtDesc('Enter command working directory '),
      message: '/home/$USER/projects/modteets'
    }
  }
};

/* eslint-disable no-console */
module.exports = (type, done) => {
  console.log(`\n${whiteBright('Add Definition')}: ${cyan(type)}\n`);

  prompt.message = '>>';
  prompt.delimiter = chalk.cyan('> ');
  prompt.start();
  prompt.get(
    {
      properties: props[type]
    },
    done
  );
};
/* eslint-enable no-console */
