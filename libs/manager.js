/* Task Manager Functions */

const chalk = require('chalk');
const dataworker = require('./work_with_data');

class Manager {
    
    constructor() {
        // Valid priority of task
        this.valid_priority_num = /^[1|2|3]$/;

        // Color Palette
        this.output_colors_name = ['inessental', 'average', 'important',];
        this.output_colors = {
            important: {
                text: {r: 250, g: 250, b: 250},
                bg: {r: 141, g: 127, b: 210}
            },
            average: {
                text: {r: 93, g: 85, b: 190},
                bg: {r: 250, g: 250, b: 250}
            },
            inessental: {
                text: {r: 211, g: 201, b: 237},
                bg: null
            },
            primary: {r: 211, g: 201, b:237}
        };

        // Get correct file path ./data/data_file.json
        let take_data_file_dir = () => { 
            let data_file_dir_str = ''
            let data_file_dir_folders = __dirname.split('\\').slice(0, __dirname.split('\\').length - 1);
            data_file_dir_str = (data_file_dir_folders[0]+'\\');
            data_file_dir_folders = data_file_dir_folders.slice(1);
            data_file_dir_str = data_file_dir_str + data_file_dir_folders.join('\\') + '\\data\\data_file.json';
            return data_file_dir_str;
        }
        this.data_file_dir = take_data_file_dir();  
    }

    print_blank_line() {
        /* Just Blank Line */
        console.log('----------------')
    }

    return_error(text) {
        /* Return Error Template */
        console.log();
        this.print_blank_line();
        console.log(chalk.redBright(`   Error! ${text}`));
        this.print_blank_line();
    }

    return_warning(text) {
        /* Return Warning Template */
        console.log();
        this.print_blank_line();
        console.log(chalk.yellowBright(`    Warning! ${text}`));
        this.print_blank_line();
    }

    return_success() {
        /* Return Seccess of Operation */
        console.log();
        this.print_blank_line();
        console.log(chalk.greenBright(`    Success!`));
        this.print_blank_line();
    }

    add_task(task) {
        /* Add Task to Data File */
        dataworker.add_task(this.data_file_dir, task);

        this.return_success();
    }

    print_task(id, task, color) {
        /* Print Task With Correct Selection */
        let {r, g, b} = this.output_colors.primary;
        id++; 
        if (color.bg != null)
            console.log(
                '| ' + chalk.rgb(r, g, b)(id) +
                ' | ' + chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b)
                .rgb(color.text.r, color.text.g, color.text.b)(' ' + task + ' ') + '.'
            )
        else 
            console.log(
                '| ' + chalk.rgb(r, g, b)(id) +
                ' | ' + chalk.rgb(color.text.r, color.text.g, color.text.b)(' '+task+'.')
            )
    }

    get_task_list(sort_type) {
        /* Output all Tasks with Choiced Sort Type */
        const task_list = dataworker.get_tasks(this.data_file_dir, sort_type);
        let id = 0;

        console.log();
        this.print_blank_line();
        if (task_list.length)
            while (id < task_list.length) {
                let task_priority = task_list[id]['priority'];
                if (task_priority == 3)
                    this.print_task(id, task_list[id].text, this.output_colors['important'])
                else if (task_priority == 2) 
                    this.print_task(id, task_list[id].text, this.output_colors['average'])
                else 
                    this.print_task(id, task_list[id].text, this.output_colors['inessental'])
                id++;
            }
        else 
            console.log(chalk.yellowBright('    Task list is clear.'))
        this.print_blank_line();
    }

    update_task(id, task_text, task_priority) {
        /* Updating Task with Id */
        let task_list = dataworker.get_tasks(this.data_file_dir, 'last');
        id--;
        if (task_priority >= 0 && task_priority <= 3) {
            task_list[id].priority = task_priority;
            task_list[id].text = task_text;
            dataworker.update_task_list(this.data_file_dir, task_list);

            this.return_success()
        } else {
            this.return_error('Invalid task priority!');
        }
    }

    remove_task(id) {
        /* Remove Task with Id */
        let task_list = dataworker.get_tasks(this.data_file_dir, 'last');
        id--;
        if (id >= 0 && id < task_list.length) {
            task_list = [
                ...task_list.slice(0, id),
                ...task_list.slice(++id)
            ]
            dataworker.update_task_list(this.data_file_dir, task_list);

            this.return_success();
        } else {
            this.return_error('There is no task with this id!')
        }        
    }
}

module.exports = Manager
