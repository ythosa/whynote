#!/usr/bin/env node  
    // indicates that processing should be carried out NodeJS

/* -*- coding: utf-8 -*- */

    /* author: Ythosa */
    // cli label: whynote
    // cli command: note

/* npm link --force   -   adding module to console */    

    /* Importing dependencies */
const commander = require('commander')
const {prompt} = require('inquirer')
const chalk = require('chalk')
const Manager = require('./libs/manager')

// Set commander version and description
// note --version|-V
// note --help|-h
commander.version('v1.0.0').description('Command line interface, which implements a notepad task manager.')

// Create task manager
const manager = new Manager()

    /* Commander Commands */ 
// note list [options]  -  get list of notes
commander
    .command('list')
    .alias('l')
    .option('--sort <sort_type>', 'Type of sort list of tasks.')
    .description('Get list of tasks.')
    .action((cmd) => {
        // Output list of tasks with selected type of sort
            // sort_type can be priority or time or all
        manager.get_task_list();
    })

// note add - adding some task 
commander
    .command('add')
    .alias('a')
    .description('Adding task.')
    .action((cmd) => {
        prompt([
            {type: 'input', name: 'task_text', message: 'Task text: '},
            {type: 'input', name: 'task_priority', message: 'Task priority: '}
        ]).then((options) => {
            // Add task with <name> and <priority>
            let task_data = [];
            for (prop in options) {
                task_data.push(options[prop]);
            }

            let task_text = task_data[0];
            let task_priority = task_data[1];
            if (task_priority > 0 && task_priority < 4) {
                let task_date = Date.now();
                let task = {
                    'priority': task_priority,
                    'text': task_text,
                    'date': task_date
                }
                manager.add_task(task);
            } else {
                manager.return_error('Invalid task priority!');
            }
        })
    })

// note remove <id>  -  remove from task list task with some id
commander
    .command('remove')
    .alias('rv')
    .description('Remove complete or not actual task from task list with <id>.')
    .action((cmd) => {
        // Remove task with <id>
    })

// note modification <id>  -  modification task with some id
commander
    .command('modific')
    .alias('mod')
    .description('Modification task: text and priority with <id>.')
    .action((cmd) => {
        prompt([
            {type: 'input', name: 'task_text', message: 'Task text: '},
            {type: 'input', name: 'task_priority', message: 'Task priority'}
        ]).then((options) => {
            // Update task with <task_text> and <task_priority>
        })
    })

commander.parse(process.argv)  // Take array of string for parsing
