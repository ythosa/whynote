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

// note add-task  -  adding some task
commander
.command('add-task')
.alias('at')
.description('Adding task.')
.action((cmd) => {
    let task_list_length = dataworker.get_tasks(manager.data_file_dir).length;

    let to_prompt = [
        {
            type: 'input',
            name: 'task_text', 
            message: 'Task text: ',
        },
        {
            type: 'input', 
            name: 'deadline', 
            message: 'Deadline: ',
        },
    ]

    if (task_list_length < 9)
        prompt(to_prompt).then((options) => {
            // Add task with <name> and <priority>

            // Extraction task text and priority
            let task_data = [];
            for (prop in options) {
                task_data.push(options[prop]);
            }
            let task_text = task_data[0];
            let task_deadline = String(task_data[1]).trim();

            let is_deadline_correct = true;
            let day, month, year, hours, minutes;
            is_deadline_correct = manager.valid_deadline.test(task_deadline);

            // Validation deadline
            let date = new Date();
            if (is_deadline_correct) {
                day = task_deadline.replace(manager.valid_deadline, '$1');
                if (day <= 0 || day >= 32) is_deadline_correct = false; 

                month = task_deadline.replace(manager.valid_deadline, '$2') - 1;
                if (month <= -1 || month >= 12) is_deadline_correct = false;

                year = date.getUTCFullYear();

                hours = task_deadline.replace(manager.valid_deadline, '$4');
                if (hours == '') hours = null;
                if (hours != null && (hours <= -1 || hours >= 23)) is_deadline_correct = false;

                minutes = task_deadline.replace(manager.valid_deadline, '$5');
                if (minutes == '') minutes = null;
                if (minutes != null && (minutes <= -1 || minutes >= 60)) is_deadline_correct = false;
            
                // Checking if deadline < now date
                let task_dl_date = new Date(year, month, day, hours, minutes, 0);
                if (task_dl_date < Date.now()) is_deadline_correct = false
            }

            if (is_deadline_correct) {                
                if (hours != null && minutes != null)
                    task_deadline = {
                        'year': year,
                        'month': month,
                        'day': day,
                        'hours': hours,
                        'minutes': minutes,
                    }
                else
                    task_deadline = {
                        'year': year,
                        'month': month,
                        'day': day,
                        'hours': 23,
                        'minutes': 59,
                    }

                // Create task dict
                let task_date = Date.now();
                let task = {
                    'priority': 1,
                    'text': task_text,
                    'date': task_date,
                    'deadline': task_deadline,
                }
                // Adding task to task list
                manager.add_task(task);
            } else {
                manager.return_error('Invalid deadline input!')
            }
        })
    else
        manager.return_warning('You have too many tasks.');
})

// note add-note - adding some note 
commander
    .command('add-note')
    .alias('an')
    .description('Adding note.')
    .action((cmd) => {
        let task_list_length = dataworker.get_tasks(manager.data_file_dir).length;
        let to_prompt = [
            {
                type: 'input',
                name: 'task_text', 
                message: 'Task text: ',
            },
            {
                type: 'input', 
                name: 'task_priority', 
                message: 'Task priority: ',
            },
        ]

        if (task_list_length < 9)
            prompt(to_prompt).then((options) => {
                // Add task with <name> and <priority>

                // Extraction task text and priority
                let task_data = [];
                for (prop in options) {
                    task_data.push(options[prop]);
                }
                let task_text = task_data[0];
                let task_priority = String(task_data[1]);
                task_priority = task_priority.trim();
               
                if (manager.valid_priority_num.exec(task_priority) || manager.valid_priority.exec(task_priority)) {
                    if (!manager.valid_priority_num.exec(task_priority)) 
                        task_priority = manager.output_colors_name.indexOf(task_priority) + 1;

                    // Create task dict
                    let task_date = Date.now();
                    let task = {
                        'priority': task_priority,
                        'text': task_text,
                        'date': task_date,
                        'deadline': null,
                    }
                    // Adding task to task list
                    manager.add_task(task);
                } else {
                    manager.return_error('Invalid task priority!');
                }
            })
        else {
            manager.return_warning('You have too many tasks.');
        }
    })

// note remove <id>  -  remove from task list task with some id
commander
    .command('remove <id>')
    .alias('rv')
    .description('Remove complete or not actual task from task list with <id>.')
    .action((id, cmd) => {
        // Remove task with <id>
        prompt([
            {
                type: 'confirm', 
                name: 'confirm', 
                message: 'Are you sure? ',
            }
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
                {
                    type: 'input',
                    name: 'task_text',
                    message: 'Task text: ',
                },
                {
                    type: 'input', 
                    name: 'task_priority', 
                    message: 'Task priority: ',
                }
            ]).then((options) => {
                // Update task with <task_text> and <task_priority>
                let task_data = [];
                for (prop in options) {
                    task_data.push(options[prop]);
                }
                let task_text = task_data[0];
                let task_priority = task_data[1];

                if ((manager.valid_priority_num.exec(task_priority)) || (manager.valid_priority.exec(task_priority) || (task_priority == '-'))) {
                    if (!manager.valid_priority_num.exec(task_priority) && task_priority != '-') 
                        task_priority = manager.output_colors_name.indexOf(task_priority) + 1;
                    manager.update_task(id, task_text, task_priority);
                } else {
                    manager.return_error('Ivalid priority input!')
                }
            })
        else 
            manager.return_error('Invalid task id!');
    })

commander.parse(process.argv)  // Take array of string for parsing
