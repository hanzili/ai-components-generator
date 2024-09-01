#!/usr/bin/env node
import { program } from 'commander';
import { generate, iterate, init } from '../src/commands.js';

program
  .command('init')
  .description('Initialize ai-components.json file')
  .action(init);

program
  .command('generate <componentName> [prompt]')
  .description('Generate a new component')
  .action(generate);

program
  .command('iterate <componentName> <prompt>')
  .description('Iterate on an existing component')
  .action(iterate);

program.parse(process.argv);