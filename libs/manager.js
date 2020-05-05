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

        // Lists names
        this.lists_names = /^(overdue-list)|(task-list)|(note-list)$/;
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

    classification_task_list(tasks) {
        /* Returns Task List and Overdue Tasks */

        let valid_tasks = {
            'tasks': [],
            'to_print': []
        }

        let overdue_tasks = {
            'tasks': [],
            'to_print': []
        }

        /* To_Print Classified Tasks Template */
        // to_print_template = [
        //     {
        //         'month': <number>,
        //         'tasks': [
        //             'day': <number>,
        //             'tasks': [
        //                 <array_of_tasks>
        //             ]
        //         ]
        //     },
        //    {
        //        ...
        //    }
        // ]

        let classif_pusher = (tasks, task, month, day) => {
            let classified_tasks = tasks.to_print;
            let data_tasks = tasks.tasks;
            data_tasks.push(task);

            let is_month_exist = false;
            let t_month_id;

            if (classified_tasks)
                for (t_month_id in classified_tasks) {
                    if (classified_tasks[t_month_id].month == month)
                    {
                        is_month_exist = true;
                        break;
                    }
                }
            if (!is_month_exist) {
                classified_tasks.push(
                    {
                        'month': month,
                        'tasks': [
                            {
                                'day': day,
                                'tasks': [ task ]
                            }
                        ]
                    }
                )
            } else {
                let is_date_exist = false;

                let t_day_id;
                for (t_day_id in classified_tasks[t_month_id].tasks)
                    if (classified_tasks[t_month_id].tasks[t_day_id].day == day)
                    {
                        is_date_exist = true;
                        break;
                    }
                if (!is_date_exist) {
                    classified_tasks[t_month_id].tasks.push(
                        {
                            'day': day,
                            'tasks': [ task ]
                        }
                    )
                } else {
                    classified_tasks[t_month_id].tasks[t_day_id].tasks.push(task);
                }
            }

            return {
                "tasks": data_tasks,
                "to_print": classified_tasks,
            }
        }

        let current_date = new Date()
        for (let t_id in tasks) {
            let {year, month, day, ...other} = tasks[t_id].deadline;
            let task_date = new Date(year, month, day, 23, 59, 59);
            if (task_date < current_date) {
                overdue_tasks = classif_pusher(overdue_tasks, tasks[t_id], month, day)
            } else {
                valid_tasks = classif_pusher(valid_tasks, tasks[t_id], month, day)
            }
        }
        return {
            "overdue_tasks": overdue_tasks,
            "valid_tasks": valid_tasks
        }
    }

    print_task_list(tlist, id_t) {
        for (let t_month in tlist) {
            let {r, g, b} = this.output_colors.primary;
            let color = this.output_colors.important;
            // Print mounth of group of tasks
            console.log(chalk.rgb(r, g, b)('· ') +
                chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                (` ${this.getMonthFromNumber(tlist[t_month].month)} `) + chalk.rgb(r, g, b)(':'))
            for (let t_day in tlist[t_month].tasks) {
                color = this.output_colors.average;
                let day_format_string = this.dayNumberToString(tlist[t_month].tasks[t_day].day)
                // Print day of group of tasks
                console.log(
                    chalk.rgb(r, g, b)(`·· `) +
                    chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                    (` by the ${day_format_string} `) +
                    chalk.rgb(r, g, b)(':')
                );
                // Print tasks for this day
                tlist[t_month].tasks[t_day].tasks.forEach(task => {
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
        return id_t
    }

    async get_groups_of_tasks() {
        /* Return tasks by groups: notes, tasks, overdue tasks */
        let task_list;
        try {
            task_list = await dataworker.get_tasks(this.data_file_dir)
        } catch(err) {
            this.return_error(err);
            await this.get_groups_of_tasks();
        }

        let nlist = [];
        let tlist = [];
        let olist = [];

        // Splitting the list by deadline on `tasks_nottime` and `tasks_bytime`
        for (let task of task_list)
            if (task.deadline == null)
                nlist.push(task)
            else
                tlist.push(task)

        task_list = this.sorting_tasks_with_dl(tlist);
        task_list = this.classification_task_list(task_list);

        olist = task_list.overdue_tasks.tasks;
        tlist = task_list.valid_tasks.tasks;

        return {
            'overdue_list': olist,
            'task_list': tlist,
            'note_list': nlist
        }
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
                // Exit
                return 0
            }

            let id_t = 1;
            let overdue_tasks = null, valid_tasks = null;
            // Output tasks with deadline
            if (to_print == 'tasks' || to_print == 'overdue' || to_print == null) {
                tasks_bytime = this.sorting_tasks_with_dl(tasks_bytime);
                tasks_bytime = this.classification_task_list(tasks_bytime);
                overdue_tasks = tasks_bytime.overdue_tasks;
                valid_tasks = tasks_bytime.valid_tasks;

                // Print overdue task list
                if (to_print == 'overdue' || to_print == 'tasks')
                    if (overdue_tasks.to_print.length) {
                        let label = `   ~-~Overdue Task List~-~`
                        console.log();
                        this.print_blank_line(label);
                        console.log(label);
                        this.print_blank_line(label);
                        id_t = this.print_task_list(overdue_tasks.to_print, id_t)
                        this.print_blank_line(label)
                    } else
                        if (to_print == 'overdue')
                            this.return_warning('Overdue task list is empty.')

                // Print valid task list
                if (to_print != 'overdue')
                    if (valid_tasks.to_print.length) {
                        let label = `   ~-~Task List~-~`
                        console.log();
                        this.print_blank_line(label);
                        console.log(label);
                        this.print_blank_line(label);
                        id_t = this.print_task_list(valid_tasks.to_print, id_t)
                        this.print_blank_line(label)
                    } else
                        this.return_warning('Task list is empty.')
            }

            // Output tasks without deadline
            if (to_print == 'notes' || to_print == null) {
                // Sorting note list by priority
                tasks_nottime = tasks_nottime.sort((t1, t2) => {
                    return t1.priority < t2.priority
                })
                // Output note list
                if (tasks_nottime.length) {
                    let label = `   ~-~Note List~-~`
                    console.log();
                    this.print_blank_line(label);
                    console.log(label)
                    this.print_blank_line(label);
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
                    this.print_blank_line(label);
                } else {
                    this.return_warning('Note list is empty.')
                }
            }

            // Updating data file to arrange tasks in the correct order for further actions
            if (to_print == 'tasks' || to_print == 'overdue' || to_print == null)
                if (overdue_tasks == null)
                    if (valid_tasks == null)
                        dataworker.update_task_list(this.data_file_dir, [
                            ...tasks_nottime
                        ])
                    else
                        dataworker.update_task_list(this.data_file_dir, [
                            ...valid_tasks.tasks,
                            ...tasks_nottime
                        ])
                else
                    if (valid_tasks == null)
                        dataworker.update_task_list(this.data_file_dir, [
                            ...overdue_tasks.tasks,
                            ...tasks_nottime
                        ])
                    else
                        dataworker.update_task_list(this.data_file_dir, [
                            ...overdue_tasks.tasks,
                            ...valid_tasks.tasks,
                            ...tasks_nottime
                        ])
            else if (to_print == 'notes')
                if (overdue_tasks == null)
                    if (valid_tasks == null)
                        dataworker.update_task_list(this.data_file_dir, [
                            ...tasks_nottime
                        ])
                    else
                        dataworker.update_task_list(this.data_file_dir, [
                            ...tasks_nottime,
                            ...valid_tasks.tasks
                        ])
                else
                    if (valid_tasks == null)
                        dataworker.update_task_list(this.data_file_dir, [
                            ...tasks_nottime,
                            ...overdue_tasks.tasks
                        ])
                    else
                        dataworker.update_task_list(this.data_file_dir, [
                            ...tasks_nottime,
                            ...overdue_tasks.tasks,
                            ...valid_tasks.tasks
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

            if ((this.valid_priority_num.exec(task_priority)) || (this.valid_priority.exec(task_priority) || (task_priority == '-'))) {
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
                } else {
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

    async clear_list(list_name) {
        /* Clear list of tasks with <list_name> */

        let {'overdue_list': olist, 'task_list': tlist, 'note_list': nlist} = await this.get_groups_of_tasks();
        let list;
        if (list_name === 'overdue-list')
            list = [
                ...tlist,
                ...nlist
            ]
        else if (list_name === 'task-list')
            list = [
                ...olist,
                ...nlist
            ]
        else if (list_name === 'note-list')
            list = [
                ...olist,
                ...tlist
            ]
        dataworker.update_task_list(this.data_file_dir, list);

        this.return_success()
    }
}

module.exports = Manager
