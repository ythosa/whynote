/* Task Manager Functions */

const chalk = require('chalk');
const dataworker = require('./work_with_data');

class Manager {

    constructor() {
        // Valid priority of task
        this.valid_priority_num = /^[1|2|3]$/;
        this.valid_priority = /^[(inessental)|(average)|(important)]$/;

        // Valid task deadline
        this.valid_deadline = /^(\d+)[-|\/|.](\d+)( (\d+)\:(\d{2}))?$/;

        // Valid task id
        this.valid_task_id_nums = /^\d+$/;
        this.valid_task_id_interval = /^(\d+)-(\d+)$/;

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
        this.data_file_dir = dataworker.take_data_file_dir();

        // Max note + task list length
        this.max_list_length = 30;
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
        /* Adding Task to Data File */
        dataworker.add_task(this.data_file_dir, task);

        this.return_success();
    }


    print_note(id, task, color) {
        /* Print Task With Correct Selection */
        let {r, g, b} = this.output_colors.primary;
        id++;
        let id_str = this.id_num2str(id)

        if (color.bg != null)
            console.log(
                '|' + chalk.rgb(r, g, b)(`${id_str}`) +
                '| ' + chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b)
                .rgb(color.text.r, color.text.g, color.text.b)(' ' + task + ' ') + '.'
            )
        else
            console.log(
                '|' + chalk.rgb(r, g, b)(id_str) +
                '| ' + chalk.rgb(color.text.r, color.text.g, color.text.b)(''+task+'.')
            )
    }

    validation_deadline(task_deadline) {
        /* Checking whether the deadline is correct */
        let is_deadline_correct = this.valid_deadline.test(task_deadline);
        let reason_of_error;

        let date = new Date();
        let year, month, day, hours, minutes;
        if (is_deadline_correct) {
            day = task_deadline.replace(this.valid_deadline, '$1');
            if (day <= 0 || day >= 32) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s day input!';
            }

            month = task_deadline.replace(this.valid_deadline, '$2') - 1;
            if (month <= -1 || month >= 12) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s month input!';
            }

            year = date.getUTCFullYear();

            hours = task_deadline.replace(this.valid_deadline, '$4');
            if (hours == '') hours = null;
            if (hours != null && (hours <= -1 || hours >= 23)) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s hours input!';
            }

            minutes = task_deadline.replace(this.valid_deadline, '$5');
            if (minutes == '') minutes = null;
            if (minutes != null && (minutes <= -1 || minutes >= 60)) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s minutes input!';
            }

            // Checking if deadline < now date
            let task_dl_date = new Date(year, month, day, hours, minutes, 0);
            if (task_dl_date < Date.now()) {
                is_deadline_correct = false;
                reason_of_error = 'The deadline of the task before today\'s date!';
            }
        } else {
            reason_of_error = `The deadline must be 'DD.MM' or 'DD.MM mm:hh'!`;
        }
        return [is_deadline_correct, year, month, day, hours, minutes, reason_of_error]
    }

    sorting_tasks_with_dl(task_list) {
        /* Sorting tasks by time, thus sorting the final array */
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

    dayNumberToString(day) {
        /* Formatting ordinal numbers for a date */
        let last_num = day % 10;
        if (last_num == 1) {
            day = `${day}'st`
        } else if (last_num == 2) {
            day = `${day}'nd`
        } else if (last_num == 3) {
            day = `${day}'rd`
        } else {
            day = `${day}'th`
        }
        return day
    }

    id_num2str(id) {
        let id_str = '';
        if (id < 10) {
            id_str = `0${id}`;
        } else {
            id_str = `${id}`;
        }
        return id_str
    }

    print_list(to_print=null) {
        /* Output all Tasks with Choiced Sort Type */
        
        dataworker.get_tasks(this.data_file_dir, 'last').then(task_list => {
            // Awaited promise
            // Splitting the list by deadline on `tasks_nottime` and `tasks_bytime`
            let tasks_nottime = [];
            let tasks_bytime = [];
            for (let task of task_list)
                if (task.deadline == null)
                    tasks_nottime.push(task)
                else
                    tasks_bytime.push(task)
            if (tasks_bytime.length == 0 && tasks_nottime.length == 0 && to_print == null) {
                this.return_warning('Task and note list is empty.')
                return 0
            }
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
                        // Print mounth of group of tasks
                        console.log(chalk.rgb(r, g, b)('· ') +
                            chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                            (` ${this.getMonthFromNumber(classified_tasks_bytime[t_month].month)} `) + chalk.rgb(r, g, b)(':'))
                        for (let t_day in classified_tasks_bytime[t_month].tasks) {
                            color = this.output_colors.average;
                            let day_format_string = this.dayNumberToString(classified_tasks_bytime[t_month].tasks[t_day].day)
                            // Print day of group of tasks
                            console.log(
                                chalk.rgb(r, g, b)(`·· `) +
                                chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                                (` by the ${day_format_string} `) +
                                chalk.rgb(r, g, b)(':')
                            );
                            // Print tasks for this day
                            classified_tasks_bytime[t_month].tasks[t_day].tasks.forEach(task => {
                                let id_str = this.id_num2str(id_t);
                                if (task.deadline.hours == 23 && task.deadline.minutes == 59)
                                    console.log(chalk.rgb(r, g, b)(`··· |${id_str}| ${task.text}`))
                                else
                                    console.log(
                                        chalk.rgb(r, g, b)(`··· |${id_str}| ${task.text} `) +
                                        chalk.rgb(r, g, b)('̾') +
                                        chalk.rgb(r, g, b).underline(`by ${task.deadline.hours}:${task.deadline.minutes} o'clock`) +
                                        chalk.rgb(r, g, b)('̾')
                                    )
                                id_t++;
                            })
                        }
                    }
                    this.print_blank_line(null)
                } else {
                    this.return_warning('Task list is empty.')
                }
            }

            // Output tasks without deadline
            if (to_print == 'notes' || to_print == null) {
                // Sorting note list by priority
                tasks_nottime = tasks_nottime.sort((t1, t2) => {
                    return t1.priority < t2.priority
                })
                // Output note list
                if (tasks_nottime.length) {
                    console.log();
                    this.print_blank_line();
                    console.log(`   ~-~Note List~-~`)
                    this.print_blank_line(null);
                    let id_n = 0;
                    while (id_n < tasks_nottime.length) {
                        // Choosing note's formatting by priority
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
                    this.return_warning('Note list is empty.')
                }
            }
            // Updating data file to arrange tasks in the correct order for further actions
            if (to_print == 'tasks')
                dataworker.update_task_list(this.data_file_dir, [
                    ...tasks_bytime,
                    ...tasks_nottime
                ])
            else if (to_print == 'notes')
                dataworker.update_task_list(this.data_file_dir, [
                    ...tasks_nottime,
                    ...tasks_bytime
                ])
            else
                dataworker.update_task_list(this.data_file_dir, [
                    ...tasks_bytime,
                    ...tasks_nottime
                ])
        }).catch(err => {
            // Try again
            this.return_error(err);
            this.print_list(to_print);
        })
    }

    update_task(id, task_text, task_priority, task_deadline) {
        /* Updating Task with Id */
        dataworker.get_tasks(this.data_file_dir, 'last').then(task_list => {
            id--;

            if (
                    (this.valid_priority_num.exec(task_priority))
                    || (this.valid_priority.exec(task_priority)
                    || (task_priority == '-'))
                ) {

                if (task_deadline != '-') {
                    let [
                        is_deadline_correct, year, month, day, hours, minutes, reason_of_error
                    ] = this.validation_deadline(task_deadline)

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
                        this.return_error(reason_of_error);
                    }
                }
            } else {
                this.return_error('Ivalid priority input!')
            }
        }).catch(err => {
            // Try again
            this.return_error(err);
            this.update_task(id, task_text, task_priority, task_deadline);
        })
    }

    remove_task(id) {
        /* Removing Task with Id */
        dataworker.get_tasks(this.data_file_dir, 'last').then(task_list => {
            if (id == 'all') {
                // Remove all tasks
                dataworker.update_task_list(this.data_file_dir, []);

                this.return_success();
            } else if (this.valid_task_id_nums.exec(id)) {
                // Remove task with `id`
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
                // Remove tasks with `id` from `start` to `end`
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
        }).catch(err => {
            // Try again
            this.return_error(err);
            this.remove_task(id)
        })
    }
}

module.exports = Manager
