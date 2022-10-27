#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';
import * as figlet from 'figlet';
import * as chalk from 'chalk';
import * as yargs from 'yargs';
import * as template from './utils/template';

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
const CURR_DIR = process.cwd();

// Define constants
const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES,
        when: () => !yargs.argv['template'],
    },
    {
        name: 'name',
        type: 'input',
        message: 'Project name:',
        validate: function (input: string) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        },
        when: () => !yargs.argv['name'],
    }
];
// list of file/folder that should not be copied
const SKIP_FILES = ['node_modules', '.template.json'];

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

function createDirectoryContents(templatePath: string, projectName: string) {
    // read all files/folders (1 level) from template folder
    const filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);

        // get stats about the current file
        const stats = fs.statSync(origFilePath);

        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1) return;

        if (stats.isFile()) {
            // read file content and transform it using template engine
            let contents = fs.readFileSync(origFilePath, 'utf8');
            // replace template variable
            contents = template.render(contents, { projectName });

            // write file to destination folder
            const writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            // create folder in destination folder
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            // copy files/folder inside current folder recursively
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}

// Handle
// Show title
console.log(
    chalk.yellow(
        figlet.textSync('Tuntun CLI', { horizontalLayout: 'full' })
    )
);
inquirer.prompt(QUESTIONS).then((answers: IAnswer) => {
    answers = Object.assign({}, answers, yargs.argv);
    const {template, name} = answers;
    const templatePath = path.join(__dirname, 'templates', template);
    const targetPath = path.join(CURR_DIR, name);
    if (!createProject(targetPath)) {
        return;
    }

    createDirectoryContents(templatePath, name);
    console.log(
        chalk.green('Create project success!! Folder is in ' + targetPath)
    );
});
