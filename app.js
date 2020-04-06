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
const Manager = require('./libs/manager')
const dataworker = require('./libs/work_with_data')

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
        if (cmd.sort)
            if (cmd.sort == 'priority' ||  cmd.sort == 'date')
                manager.get_task_list(cmd.sort)
            else 
                manager.return_error('Invalid type of sort.')
        else
            manager.get_task_list('priority')
    })

// note add - adding some task 
commander
    .command('add')
    .alias('a')
    .description('Adding task.')
    .action((cmd) => {
        let task_list_length = dataworker.get_tasks(manager.data_file_dir).length;
        if (task_list_length < 9)
            prompt([
                {type: 'input', name: 'task_text', message: 'Task text: '},
                {type: 'input', name: 'task_priority', message: 'Task priority: '}
            ]).then((options) => {
                // Add task with <name> and <priority>

                // Extraction task text and priority
                let task_data = [];
                for (prop in options) {
                    task_data.push(options[prop]);
                }
                let task_text = task_data[0];
                let task_priority = task_data[1];

                if ((manager.valid_priority_num.exec(task_priority)) || (manager.valid_priority.exec(task_priority))) {
                    if (!manager.valid_priority_num.exec(task_priority)) 
                        task_priority = manager.output_colors_name.indexOf(task_priority) + 1;

                    // Create task dict
                    let task_date = Date.now();
                    let task = {
                        'priority': task_priority,
                        'text': task_text,
                        'date': task_date
                    }
                    // Adding task to task list
                    manager.add_task(task);
                } else {
                    manager.return_error('Invalid task priority!');
                }
            })
        else
            manager.return_warning('You have too many tasks.');
    })

// note remove <id>  -  remove from task list task with some id
commander
    .command('remove <id>')
    .alias('rv')
    .description('Remove complete or not actual task from task list with <id>.')
    .action((id, cmd) => {
        // Remove task with <id>
        prompt([
            {type: 'confirm', name: 'confirm', message: 'Are you sure? '}
        ]).then((options) => {
            if (options.confirm)
                manager.remove_task(id);
        })
    })

// note modification <id>  -  modification task with some id
commander
    .command('modific <id>')
    .alias('mod')
    .description('Modification task: text and priority with <id>.')
    .action((id, cmd) => {
        let task_list_length = dataworker.get_tasks(manager.data_file_dir).length;
        if (id >= 1 && id <= task_list_length) 
            prompt([
                {type: 'input', name: 'task_text', message: 'Task text: '},
                {type: 'input', name: 'task_priority', message: 'Task priority: '}
            ]).then((options) => {
                // Update task with <task_text> and <task_priority>
                let task_data = [];
                for (prop in options) {
                    task_data.push(options[prop]);
                }
                let task_text = task_data[0];
                let task_priority = task_data[1];

                manager.update_task(id, task_text, task_priority);
            })
        else 
            manager.return_error('Invalid task id!');
    })

commander.parse(process.argv)  // Take array of string for parsing
