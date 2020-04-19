/* Task Manager Functions */

const chalk = require('chalk');
const dataworker = require('./work_with_data');

class Manager {
    
    constructor() {
        // Valid priority of task
        this.valid_priority_num = /^[1|2|3]$/;
        this.valid_priority = /[(inessental)|(average)|(important)']/;

        // Valid task deadline
        this.valid_deadline = /^(\d+)[-|\/|.](\d+)( (\d+)\:(\d{2}))?$/;

        // Valid task id
        this.valid_task_id_nums = /^[0-9]$/;
        this.valid_task_id_interval = /^([0-8])-([0-9])$/;

        // Color Palette
        this.output_colors_name = [
            'inessental',
            'average',
            'important',
        ]
        this.output_colors = {
            important: {
                text: {r: 250, g: 250, b: 250},
                bg: {r: 141, g: 127, b: 210},
            },
            average: {
                text: {r: 93, g: 85, b: 190},
                bg: {r: 250, g: 250, b: 250},
            },
            inessental: {
                text: {r: 211, g: 201, b: 237},
                bg: null,
            },
            primary: {r: 211, g: 201, b:237},
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

    print_blank_line(text) {
        /* Just Blank Line */
        if (text != null) {
            let i = 0;
            let blank_line = [];
            while (i < text.length + 3) {
                blank_line.push('-')
                i++;
            }
            blank_line = blank_line.join('');
            console.log(blank_line)
        } else {
            console.log('----------------------');
        }
    }

    return_error(e) {
        /* Return Error Template */
        let text = `   Error! ${e}`;
        console.log();
        this.print_blank_line(text);
        console.log(chalk.redBright(text));
        this.print_blank_line(text);
    }

    return_warning(w) {
        /* Return Warning Template */
        let text = `    Warning! ${w}`;
        console.log();
        this.print_blank_line(text);
        console.log(chalk.yellowBright(text));
        this.print_blank_line(text);
    }

    return_success() {
        /* Return Seccess of Operation */
        let text = `    Success! `;
        console.log();
        this.print_blank_line(text);
        console.log(chalk.greenBright(text));
        this.print_blank_line(text);
    }

    add_task(task) {
        /* Add Task to Data File */
        dataworker.add_task(this.data_file_dir, task);

        this.return_success();
    }

    print_note(id, task, color) {
        /* Print Task With Correct Selection */
        let {r, g, b} = this.output_colors.primary;
        id++; 
        if (color.bg != null)
            console.log(
                '|' + chalk.rgb(r, g, b)(id) +
                '| ' + chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b)
                .rgb(color.text.r, color.text.g, color.text.b)(' ' + task + ' ') + '.'
            )
        else 
            console.log(
                '|' + chalk.rgb(r, g, b)(id) +
                '| ' + chalk.rgb(color.text.r, color.text.g, color.text.b)(''+task+'.')
            )
    }

    validation_deadline(task_deadline) {
        let is_deadline_correct = this.valid_deadline.test(task_deadline);

        // Validation deadline
        let date = new Date();
        let year, month, day, hours, minutes;
        if (is_deadline_correct) {
            day = task_deadline.replace(this.valid_deadline, '$1');
            if (day <= 0 || day >= 32) is_deadline_correct = false; 

            month = task_deadline.replace(this.valid_deadline, '$2') - 1;
            if (month <= -1 || month >= 12) is_deadline_correct = false;

            year = date.getUTCFullYear();

            hours = task_deadline.replace(this.valid_deadline, '$4');
            if (hours == '') hours = null;
            if (hours != null && (hours <= -1 || hours >= 23)) is_deadline_correct = false;

            minutes = task_deadline.replace(this.valid_deadline, '$5');
            if (minutes == '') minutes = null;
            if (minutes != null && (minutes <= -1 || minutes >= 60)) is_deadline_correct = false;
        
            // Checking if deadline < now date
            let task_dl_date = new Date(year, month, day, hours, minutes, 0);
            if (task_dl_date < Date.now()) is_deadline_correct = false
        }
        return [is_deadline_correct, year, month, day, hours, minutes]
    }

    sorting_tasks_with_dl(task_list) {
        // Sorting tasks by time, thus sorting the final array
        task_list.sort((a, b) => {
                let {'year': year1, 'month': month1, 'day': day1, 'hours': hours1, 'minutes': minutes1} = a.deadline;  
                let date1 = new Date(year1, month1, day1, hours1, minutes1, 0);

                let {'year': year2, 'month': month2, 'day': day2, 'hours': hours2, 'minutes': minutes2} = b.deadline;  
                let date2 = new Date(year2, month2, day2, hours2, minutes2, 0);

                return date1 - date2
        });
        return task_list
    }

    classification_tasks_on_time(task_list) {
        /* Classification tasks by deadline */
        let sorted_tasks = [];
        for (let t_id in task_list) {
            let {_, month, day, ...other} = task_list[t_id].deadline;
            let is_month_exist = false;

            let t_month_id
            if (sorted_tasks)
                for (t_month_id in sorted_tasks) {
                    if (sorted_tasks[t_month_id].month == month) 
                    {
                        is_month_exist = true;
                        break;
                    }
                }
            if (!is_month_exist) {
                sorted_tasks.push(
                    {
                        'month': month,
                        'tasks': [
                            {
                                'day': day,
                                'tasks': [ task_list[t_id] ]
                            }
                        ]
                    }
                )
            } else {
                let is_date_exist = false;

                let t_day_id;
                for (t_day_id in sorted_tasks[t_month_id].tasks)
                    if (sorted_tasks[t_month_id].tasks[t_day_id].day == day)
                    {
                        is_date_exist = true;
                        break;
                    }
                if (!is_date_exist) {
                    sorted_tasks[t_month_id].tasks.push(
                        {                           
                            'day': day,   
                            'tasks': [ task_list[t_id] ]
                        }
                    )
                } else {
                    sorted_tasks[t_month_id].tasks[t_day_id].tasks.push(task_list[t_id]);
                }
            }
        }
        return sorted_tasks
    }

    getMonthFromNumber(mon){
        /* Getting month's name string from month's number id */
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[mon]
      }

    print_list(to_print=null) {
        /* Output all Tasks with Choiced Sort Type */
        const task_list = dataworker.get_tasks(this.data_file_dir, 'last');
        
        // Separetion list by 
        if (task_list.length) {
            let tasks_nottime = [];
            let tasks_bytime = [];
            for (let task of task_list)
                if (task.deadline == null)
                    tasks_nottime.push(task)
                else
                    tasks_bytime.push(task)
            
            let id_t = 1;
            // Output tasks with deadline
            if (to_print == 'tasks' || to_print == null) {
                if (tasks_bytime.length) {
                    tasks_bytime = this.sorting_tasks_with_dl(tasks_bytime);
                    let classified_tasks_bytime = this.classification_tasks_on_time(tasks_bytime);
                    
                    console.log();
                    this.print_blank_line(null);
                    console.log(`   ~-~Task List~-~`);
                    this.print_blank_line(null);
                    for (let t_month in classified_tasks_bytime) {
                        let {r, g, b} = this.output_colors.primary;
                        let color = this.output_colors.important;
                        console.log(chalk.rgb(r, g, b)('· ') + 
                            chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                            (` ${this.getMonthFromNumber(classified_tasks_bytime[t_month].month)} `) + chalk.rgb(r, g, b)(':'))
                        for (let t_day in classified_tasks_bytime[t_month].tasks) {
                            color = this.output_colors.average;
                            console.log(chalk.rgb(r, g, b)(`·· `) +
                            chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)(` by the ${classified_tasks_bytime[t_month].tasks[t_day].day}'th `) + 
                            chalk.rgb(r, g, b)(':'));
                            classified_tasks_bytime[t_month].tasks[t_day].tasks.forEach(task => {
                                console.log(chalk.rgb(r, g, b)(`··· |${id_t}| ${task.text}`));
                                id_t++;
                            })
                        }
                    }
                    this.print_blank_line(null)
                } else {
                    this.return_warning('Task list is clear.')
                }
            }

            // Output tasks without deadline
            if (to_print == 'notes' || to_print == null) {
                if (tasks_nottime.length) {
                    console.log();
                    this.print_blank_line();
                    console.log(`   ~-~Note List~-~`)
                    this.print_blank_line(null);
                    let id_n = 0;
                    while (id_n < tasks_nottime.length) {
                        let task_priority = tasks_nottime[id_n]['priority'];
                        if (task_priority == 3)
                            this.print_note(id_t + id_n - 1, tasks_nottime[id_n].text, this.output_colors['important'])
                        else if (task_priority == 2) 
                            this.print_note(id_t + id_n - 1, tasks_nottime[id_n].text, this.output_colors['average'])
                        else 
                            this.print_note(id_t + id_n - 1, tasks_nottime[id_n].text, this.output_colors['inessental'])
                        id_n++;
                    }
                    this.print_blank_line(null);
                } else {
                    this.return_warning('Note list is clear.')
                }
            }

            dataworker.update_task_list(this.data_file_dir, [
                ...tasks_bytime,
                ...tasks_nottime
            ]);
        } else 
            this.return_warning('Task/note list is clear.')
        
    }

    update_task(id, task_text, task_priority, task_deadline) {
        /* Updating Task with Id */
        let task_list = dataworker.get_tasks(this.data_file_dir, 'last');
        id--;

        if ((this.valid_priority_num.exec(task_priority)) || (this.valid_priority.exec(task_priority) || (task_priority == '-'))) {

            if (task_deadline != '-') { 
                let [is_deadline_correct, year, month, day, hours, minutes] = this.validation_deadline(task_deadline)
                if (is_deadline_correct) {
                    task_deadline = {
                        "year": year,
                        "month": month,
                        "day": day,
                        "hours": hours,
                        "minutes": minutes,
                    }
                    task_list[id].deadline = task_deadline;
                    if (!this.valid_priority_num.exec(task_priority) && task_priority != '-') 
                        task_priority = this.output_colors_name.indexOf(task_priority) + 1;

                    if (task_text != '-')
                        task_list[id].text = task_text;

                    if (task_priority != '-') {
                        if (task_priority >= 0 && task_priority <= 3) {
                            task_list[id].priority = task_priority;

                            dataworker.update_task_list(this.data_file_dir, task_list);

                            this.return_success()
                        } else {
                            this.return_error('Invalid task priority!');
                        }
                    } else {
                        dataworker.update_task_list(this.data_file_dir, task_list);

                        this.return_success()
                    }
                } else {
                    this.return_error('Ivalid deadline date input!');
                }
            }
        } else {
            this.return_error('Ivalid priority input!')
        }
    }

    remove_task(id) {
        /* Remove Task with Id */
        let task_list = dataworker.get_tasks(this.data_file_dir, 'last');
        if (id == 'all') {
            // Remove all tasks
            dataworker.update_task_list(this.data_file_dir, []);

            this.return_success();
        } else if (this.valid_task_id_nums.exec(id)) {
            // Remove task with id
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
        } else if (this.valid_task_id_interval.exec(id)) {
            // Remove tasks with id from start to end
            let start = this.valid_task_id_interval.exec(id)[1] - 1;
            let end = this.valid_task_id_interval.exec(id)[2] - 1;
            if ((start < end) && (start < task_list.length - 1) && (end < task_list.length) && (start >= 0) && (end >= 1)) {
                task_list = [
                    ...task_list.slice(0, start),
                    ...task_list.slice(end+1)
                ]
                dataworker.update_task_list(this.data_file_dir, task_list);

                this.return_success();
            } else {
                this.return_error('Invalid id!');
            }
        } else {
            this.return_error('Invalid id!');
        }
    }
}

module.exports = Manager
