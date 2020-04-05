/* Task Manager Functions */

const chalk = require('chalk');
const dataworker = require('./work_with_data');

class Manager {
    constructor() {
        this.current_task_list = [];

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
        console.log('-----------------')
    }

    return_error(text) {
        this.print_blank_line();
        console.log(chalk.redBright(`Error! ${text}`));
        this.print_blank_line();
    }

    add_task(task) {
        dataworker.add_task(this.data_file_dir, task);
    }

    print_task(id, task, color) {
        let {r, g, b} = this.output_colors.primary;
        id++; 
        if (color.bg != null)
            console.log(
                '| ' + chalk.rgb(r, g, b)(id) +
                ' | ' + chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b)
                .rgb(color.text.r, color.text.g, color.text.b)(task) + '. '
            )
        else 
            console.log(
                '| ' + chalk.rgb(r, g, b)(id) +
                ' | ' + chalk.rgb(color.text.r, color.text.g, color.text.b)(task) + '. '
            )
    }

    get_task_list(sort_type) {
        const task_list = dataworker.get_tasks(this.data_file_dir, sort_type);
        let id = 0;
        
        console.log();
        this.print_blank_line();
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
        this.print_blank_line();
    }
    
}

module.exports = Manager
