import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { generateComponent, iterateComponent } from './ai.js';

const CONFIG_FILE = 'ai-components.json';
const ENV_FILE = '.env';
const OUTPUT_DIR = 'src/components';

export async function generate(componentName) {
  try {
    const config = await fs.readJson(CONFIG_FILE);
    const prompt = config.components[componentName];
    
    if (!prompt) {
      console.error(`Component "${componentName}" not found in configuration.`);
      return;
    }

    const code = await generateComponent(prompt);
    const outputPath = path.join(OUTPUT_DIR, `${componentName}.jsx`);
    await fs.outputFile(outputPath, code);

    console.log(`Component ${componentName} generated successfully.`);
  } catch (error) {
    console.error('Error generating component:', error.message);
  }
}

export async function iterate(componentName, iterationPrompt) {
  try {
    const componentPath = path.join(OUTPUT_DIR, `${componentName}.jsx`);
    const existingCode = await fs.readFile(componentPath, 'utf-8');
    
    const updatedCode = await iterateComponent(existingCode, iterationPrompt);
    await fs.outputFile(componentPath, updatedCode);

    console.log(`Component ${componentName} updated successfully.`);
  } catch (error) {
    console.error('Error iterating component:', error.message);
  }
}

export async function init() {
  try {
    // Check for existing configuration
    const configExists = await fs.pathExists(CONFIG_FILE);
    const envExists = await fs.pathExists(ENV_FILE);

    if (configExists && envExists) {
      console.log('Configuration files already exist. Skipping initialization.');
      return;
    }

    // Prompt for OpenAI API key if .env doesn't exist
    if (!envExists) {
      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your OpenAI API key:',
          validate: input => input.trim() !== '' || 'API key cannot be empty'
        }
      ]);

      await fs.writeFile(ENV_FILE, `OPENAI_API_KEY=${apiKey.trim()}\n`);
      console.log('.env file created with API key.');
    }

    // Create ai-components.json if it doesn't exist
    if (!configExists) {
      const components = {};
      let addMore = true;

      while (addMore) {
        const { componentName, description } = await inquirer.prompt([
          {
            type: 'input',
            name: 'componentName',
            message: 'Enter the component name:',
            validate: input => input.trim() !== '' || 'Component name cannot be empty'
          },
          {
            type: 'input',
            name: 'description',
            message: 'Enter the component description:',
            validate: input => input.trim() !== '' || 'Description cannot be empty'
          }
        ]);

        components[componentName.trim()] = description.trim();

        const { continue: shouldContinue } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Do you want to add another component?',
            default: false
          }
        ]);

        addMore = shouldContinue;
      }

      await fs.writeJson(CONFIG_FILE, { components }, { spaces: 2 });
      console.log('ai-components.json has been created successfully.');
    }

    console.log('Initialization complete.');
  } catch (error) {
    console.error('Error during initialization:', error.message);
  }
}
