/* Task Manager Functions */

const chalk = require('chalk');
const dataworker = require('./work_with_data');

class Manager {
    constructor() {
        this.current_task_list = [];

        this.output_colors = ['cyan', 'magenta', 'yellow'];

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
        console.log('----------')
    }

    return_error(text) {
        this.print_blank_line();
        console.log(chalk.redBright(`Error! ${text}`));
        this.print_blank_line();
    }

    add_task(task) {
        dataworker.add_task(this.data_file_dir, task);
    }

    get_task_list() {
        const task_list = dataworker.get_tasks(this.data_file_dir);
        let current_color_index = 0;
        for (let task_id in task_list) {
            console.log(chalk[this.output_colors[current_color_index]](task_id + ' ' + task_list[task_id]))
            current_color_index++;
        }
    }
    
}

module.exports = Manager
