#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';
import * as figlet from 'figlet';
import * as chalk from 'chalk';

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
const CURR_DIR = process.cwd();

// Define constants
const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES
    },
    {
        name: 'name',
        type: 'input',
        message: 'Project name:'
    }
];

// Define interfaces
interface IAnswer {
    template: string,
    name: string,
}


// Define functions
function createProject(projectPath: string) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }
    fs.mkdirSync(projectPath);

    return true;
}

// Handle
// Show title
console.log(
    chalk.yellow(
        figlet.textSync('Tuntun CLI', { horizontalLayout: 'full' })
    )
);
inquirer.prompt(QUESTIONS).then((answers: IAnswer) => {
    const {template, name} = answers;
    const targetPath = path.join(CURR_DIR, name);
    if (createProject(targetPath)) {
        return;
    }
    console.log(template);
});
