#!/usr/bin/env node
    // indicates that processing should be carried out NodeJS

/* -*- coding: utf-8 -*- */

    /* author: Ythosa */
    // cli label: whynote
    // cli command: note

/* npm link --force   -   adding module to console */

    /* Importing dependencies */
const commander = require('commander');
const { prompt } = require('inquirer');

const Manager = require('./libs/manager');
const Dataworker = require('./libs/dataworker');
const Printer = require('./libs/printer');
const Tokens = require('./libs/tokens');

// Set commander version and description
// note --version|-V
// note --help|-h
commander.version('v1.3.0').description('Command line interface, which implements a notes and tasks manager.')

        /* Commander Commands */
// note list [options]  -  get list of notes
commander
    .command('list')
    .alias('l')
    .option('-t, --tasks', 'Get list of tasks.')
    .option('-n, --notes', 'Get list of notes.')
    .option('-o, --overdue', 'Get list of overdue tasks')
    .description('Get list of tasks.')
    .action((cmd) => {
        // Output list of tasks with selected type of sort
        if (cmd.tasks)
            Manager.print_list('tasks')
        else if (cmd.notes)
            Manager.print_list('notes')
        else if (cmd.overdue)
            Manager.print_list('overdue')
        else
            Manager.print_list()
    })

// note add-task  -  adding some task
commander
.command('add-task')
.alias('at')
.description('Adding task to task list.')
.action((cmd) => {
    Dataworker.get_tasks(Tokens.data_file_dir).then(task_list => {
        let task_list_length = task_list.length;

        Printer.print_current_date()
        console.log()

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

        if (task_list_length < Tokens.max_list_length)
            prompt(to_prompt).then((options) => {
                // Add task with <name> and <priority>

                // Extraction task text and priority
                let task_data = [];
                for (let prop in options) {
                    task_data.push(options[prop]);
                }
                let task_text = task_data[0];
                let task_deadline = String(task_data[1]).trim();

                let [
                    is_deadline_correct, year, month, day, hours, minutes, reason_of_error
                ] = Tokens.validation_deadline(task_deadline)

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
                    Manager.add_task(task);
                } else {
                    Manager.return_error(reason_of_error)
                }
            })
        else
            Printer.return_warning('You have too many tasks.');
    }).catch(err => {
        // Print error
        Printer.return_error(err);
    })
})

// note add-note - adding some note
commander
    .command('add-note')
    .alias('an')
    .description('Adding note to note list.')
    .action((cmd) => {
        Dataworker.get_tasks(Tokens.data_file_dir).then(task_list => {
            let task_list_length = task_list.length;

            let to_prompt = [
                {
                    type: 'input',
                    name: 'task_text',
                    message: 'Note text: ',
                },
                {
                    type: 'input',
                    name: 'task_priority',
                    message: 'Note priority: ',
                },
            ]

            if (task_list_length < Tokens.max_list_length)
                prompt(to_prompt).then((options) => {
                    // Add task with <name> and <priority>

                    // Extraction task text and priority
                    let task_data = [];
                    for (let prop in options) {
                        task_data.push(options[prop]);
                    }
                    let task_text = task_data[0];
                    let task_priority = String(task_data[1]);
                    task_priority = task_priority.trim();

                    if (Tokens.valid_priority_num.exec(task_priority) || Tokens.valid_priority.exec(task_priority)) {
                        if (!Tokens.valid_priority_num.exec(task_priority))
                            task_priority = Tokens.output_colors_name.indexOf(task_priority) + 1;

                        // Create task dict
                        let task_date = Date.now();
                        let task = {
                            'priority': task_priority,
                            'text': task_text,
                            'date': task_date,
                            'deadline': null,
                        }
                        // Adding task to task list
                        Manager.add_task(task);
                    } else {
                        Printer.return_error('Invalid task priority!');
                    }
                })
            else {
                Printer.return_warning('You have too many tasks.');
            }
        }).catch(err => {
            // Print error
            Printer.return_error(err);
        })
    })

// note remove <id>  -  remove from task list task with some id
commander
    .command('remove <id>')
    .alias('rv')
    .description('Remove complete or not actual task from task list with <id>.')
    .action((id) => {
        // Remove task with <id>
        prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure? ',
            }
        ]).then((options) => {
            if (options.confirm)
                Manager.remove_task(id);
        })
    })

// note modification <id>  -  modification task with some id
commander
    .command('modific <id>')
    .alias('mod')
    .description('Modification task: text and priority with <id>.')
    .action((id) => {
        Dataworker.get_tasks(Tokens.data_file_dir).then(task_list => {
            let task_list_length = task_list.length;

            if (id >= 1 && id <= task_list_length) {

                Printer.print_current_date();
                console.log();

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
                    {
                        type: 'input',
                        name: 'deadline',
                        message: 'Deadline: ',
                    }
                ]
                prompt(to_prompt).then(options => {
                    // Update task with <task_text> and <task_priority>
                    let task_data = [];
                    for (let prop in options) {
                        task_data.push(options[prop]);
                    }
                    let task_text = task_data[0];
                    let task_priority = task_data[1];
                    let task_deadline = task_data[2];
                    Manager.update_task(id, task_text, task_priority, task_deadline);
                })
                .catch((err) => console.log(err))
            } else {
                Printer.return_error('Invalid task id!');
            }
        }).catch(err => {
            // Print error
            Printer.return_error(err);
        })
    })

// note clear <list_name>  -  Clear the some list
commander
    .command('clear <list_name>')
    .alias('cl')
    .description('Clear the list with the name of the input list')
    .action((list_name, cmd) => {
        if (Tokens.lists_names.test(list_name))
            Manager.clear_list(list_name).then(r => {})
        else
            Printer.return_error('Invalid list name!')
    })

commander.program.exitOverride();

try {
    commander.parse(process.argv)  // Take array of string for parsing
} catch {
    // Find similar functions
    const command = process.argv[2]

    const to_skip_commands = ['help', '--help', '-h', '--version', '-V']

    if (command && !to_skip_commands.includes(command))
        Manager.print_similar_command(command)
}
