/* Task Manager Functions */

const Dataworker = require('./dataworker');
const Tokens = require('./tokens');
const Printer = require('./printer');
const Classifier = require('./classifier');

class Manager {

    static print_similar_command(argv) {
        /* Print similar commands */

        let cmds = Tokens.cli_commands
        let cmds_threshold = []
        for (let c in cmds) {
            cmds_threshold.push(
                [
                    Tokens.levenshteinDistance(argv, cmds[c][0]),
                    Tokens.levenshteinDistance(argv, cmds[c][1]),
                ]
            )
        }

        let min_id = {
            command: 0,
            alias: 0
        }
        for (let c in cmds_threshold) {
            if (cmds_threshold[c][0] < cmds_threshold[min_id.command][min_id.alias])
                min_id = {
                    command: c,
                    alias: 0
                }
            if (cmds_threshold[c][1] < cmds_threshold[min_id.command][min_id.alias])
                min_id = {
                    command: c,
                    alias: 1
                }
        }

        const similar_commands = []
        for (let c in cmds_threshold) {
            if (cmds_threshold[c][0] === cmds_threshold[min_id.command][min_id.alias])
                similar_commands.push(
                    {
                        command: cmds[c][0],
                        alias: cmds[c][1]
                    }
                )
            if (cmds_threshold[c][1] === cmds_threshold[min_id.command][min_id.alias])
                similar_commands.push(
                    {
                        command: cmds[c][0],
                        alias: cmds[c][1]
                    }
                )
        }


        Printer.print_similar_commands(similar_commands)
    }

    static add_task(task) {
        /* Adding Task to Data File */

        Dataworker.add_task(Tokens.data_file_dir, task);

        Printer.return_success();
    }

    static print_list(to_print=null) {
        /* Output all Tasks with Choiced Sort Type */

        Dataworker.get_tasks(Tokens.data_file_dir, 'last').then(task_list => {
            // Awaited promise
            // Splitting the list by deadline on `tasks_nottime` and `tasks_bytime`
            let tasks_nottime = [];
            let tasks_bytime = [];
            for (let task of task_list)
                if (task.deadline == null)
                    tasks_nottime.push(task)
                else
                    tasks_bytime.push(task)

            if (tasks_bytime.length === 0 && tasks_nottime.length === 0 && to_print == null) {
                Printer.return_warning('Task and note list is empty.')
                // Exit
                return 0
            }

            let id_t = 1;
            let overdue_tasks = null, valid_tasks = null;
            // Output tasks with deadline
            if (to_print == 'tasks' || to_print == 'overdue' || to_print == null) {

                Printer.print_current_date()

                tasks_bytime = Classifier.sorting_tasks_with_dl(tasks_bytime);
                tasks_bytime = Classifier.classification_task_list(tasks_bytime);
                overdue_tasks = tasks_bytime.overdue_tasks;
                valid_tasks = tasks_bytime.valid_tasks;

                // Print overdue task list
                if (overdue_tasks.to_print.length) {
                    let label = `   ~-~Overdue Task List~-~`
                    console.log();
                    Printer.print_blank_line(label);
                    console.log(label);
                    Printer.print_blank_line(label);
                    id_t = Printer.print_task_list(overdue_tasks.to_print, id_t)
                    Printer.print_blank_line(label)
                } else
                    if (to_print == 'overdue')
                        Printer.return_warning('Overdue task list is empty.')

                // Print valid task list
                if (to_print != 'overdue')
                    if (valid_tasks.to_print.length) {
                        let label = `   ~-~Task List~-~`
                        console.log();
                        Printer.print_blank_line(label);
                        console.log(label);
                        Printer.print_blank_line(label);
                        id_t = Printer.print_task_list(valid_tasks.to_print, id_t)
                        Printer.print_blank_line(label)
                    } else
                        Printer.return_warning('Task list is empty.')
            }

            // Output tasks without deadline
            if (to_print == 'notes' || to_print == null) {
                // Sorting note list by priority
                tasks_nottime.sort(({priority: p1}, {priority: p2}) => {
                    return p1 < p2
                })

                // Output note list
                if (tasks_nottime.length) {
                    let label = `   ~-~Note List~-~`
                    console.log();
                    Printer.print_blank_line(label);
                    console.log(label)
                    Printer.print_blank_line(label);
                    let id_n = 0;
                    while (id_n < tasks_nottime.length) {
                        // Choosing note's formatting by priority
                        let task_priority = tasks_nottime[id_n]['priority'];
                        if (task_priority == 3)
                            Printer.print_note(id_t + id_n - 1, tasks_nottime[id_n].text, Tokens.output_colors['important'])
                        else if (task_priority == 2)
                            Printer.print_note(id_t + id_n - 1, tasks_nottime[id_n].text, Tokens.output_colors['average'])
                        else if (task_priority == 1)
                            Printer.print_note(id_t + id_n - 1, tasks_nottime[id_n].text, Tokens.output_colors['inessential'])
                        id_n++;
                    }
                    Printer.print_blank_line(label);
                } else {
                    Printer.return_warning('Note list is empty.')
                }
            }

            // Updating data file to arrange tasks in the correct order for further actions
            if (to_print == 'tasks' || to_print == 'overdue' || to_print == null)
                if (overdue_tasks == null)
                    if (valid_tasks == null)
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...tasks_nottime
                        ])
                    else
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...valid_tasks.tasks,
                            ...tasks_nottime
                        ])
                else
                    if (valid_tasks == null)
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...overdue_tasks.tasks,
                            ...tasks_nottime
                        ])
                    else
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...overdue_tasks.tasks,
                            ...valid_tasks.tasks,
                            ...tasks_nottime
                        ])
            else if (to_print == 'notes')
                if (overdue_tasks == null)
                    if (valid_tasks == null)
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...tasks_nottime
                        ])
                    else
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...tasks_nottime,
                            ...valid_tasks.tasks
                        ])
                else
                    if (valid_tasks == null)
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...tasks_nottime,
                            ...overdue_tasks.tasks
                        ])
                    else
                        Dataworker.update_task_list(Tokens.data_file_dir, [
                            ...tasks_nottime,
                            ...overdue_tasks.tasks,
                            ...valid_tasks.tasks
                        ])
        }).catch(err => {
            // Try again
            Printer.return_error(err);
            Manager.print_list(to_print);
        })
    }

    static update_task(id, task_text, task_priority, task_deadline) {
        /* Updating Task with Id */

        Printer.print_current_date()

        Dataworker.get_tasks(Tokens.data_file_dir, 'last').then(task_list => {
            id--;

            if ((Tokens.valid_priority_num.exec(task_priority)) || (Tokens.valid_priority.exec(task_priority) || (task_priority === '-'))) {
                if (task_deadline !== '-') {
                    let [
                        is_deadline_correct, year, month, day, hours, minutes, reason_of_error
                    ] = Tokens.validation_deadline(task_deadline)

                    if (is_deadline_correct) {
                        task_deadline = {
                            "year": year,
                            "month": month,
                            "day": day,
                            "hours": hours,
                            "minutes": minutes,
                        }
                        task_list[id].deadline = task_deadline;
                        if (!Tokens.valid_priority_num.exec(task_priority) && task_priority !== '-')
                            task_priority = Tokens.output_colors_name.indexOf(task_priority) + 1;

                        if (task_text !== '-')
                            task_list[id].text = task_text;

                        if (task_priority !== '-') {
                            if (task_priority >= 0 && task_priority <= 3) {
                                task_list[id].priority = task_priority;

                                Dataworker.update_task_list(Tokens.data_file_dir, task_list);

                                Printer.return_success()
                            } else {
                                Printer.return_error('Invalid task priority!');
                            }
                        } else {
                            Dataworker.update_task_list(Tokens.data_file_dir, task_list);

                            Printer.return_success()
                        }
                    } else {
                        Printer.return_error(reason_of_error);
                    }
                } else {
                    if (!Tokens.valid_priority_num.exec(task_priority) && task_priority !== '-')
                        task_priority = Tokens.output_colors_name.indexOf(task_priority) + 1;

                    if (task_text !== '-')
                        task_list[id].text = task_text;

                    if (task_priority !== '-') {
                        if (task_priority >= 0 && task_priority <= 3) {
                            task_list[id].priority = task_priority;

                            Dataworker.update_task_list(Tokens.data_file_dir, task_list);

                            Printer.return_success()
                        } else {
                            Printer.return_error('Invalid task priority!');
                        }
                    } else {
                        Dataworker.update_task_list(Tokens.data_file_dir, task_list);

                        Printer.return_success()
                    }
                }
            } else {
                Printer.return_error('Ivalid priority input!')
            }
        }).catch(err => {
            // Try again
            Printer.return_error(err);
            Manager.update_task(id, task_text, task_priority, task_deadline);
        })
    }

    static remove_task(id) {
        /* Removing Task with Id */
        Dataworker.get_tasks(Tokens.data_file_dir, 'last').then(task_list => {
            if (id === 'all') {
                // Remove all tasks
                Dataworker.update_task_list(Tokens.data_file_dir, []);

                Printer.return_success();
            } else if (Tokens.valid_task_id_nums.exec(id)) {

                let ids = id.split(',')
                ids = ids.map((el) => {
                    el = Number(el)
                    return --el
                }).sort((a, b) => a - b)

                if (ids[0] >= 0 && ids[ids.length-1] < task_list.length) {
                    const remove_task = (id, task_list) => {
                        // Remove task with `id`
                        return [
                            ...task_list.slice(0, id),
                            ...task_list.slice(++id)
                        ]
                    }

                    for (let i = 0; i < ids.length; i++) {
                        task_list = remove_task(ids[i], task_list)

                        ids = ids.map((i) => --i)
                    }

                    Dataworker.update_task_list(Tokens.data_file_dir, task_list);

                    Printer.return_success();
                } else {
                    Printer.return_error('There is no task with this id!')
                }
            } else if (Tokens.valid_task_id_interval.exec(id)) {
                // Remove tasks with `id` from `start` to `end`
                let start = Tokens.valid_task_id_interval.exec(id)[1] - 1;
                let end = Tokens.valid_task_id_interval.exec(id)[2] - 1;
                if ((start < end) && (start < task_list.length - 1) && (end < task_list.length) && (start >= 0) && (end >= 1)) {
                    task_list = [
                        ...task_list.slice(0, start),
                        ...task_list.slice(end+1)
                    ]
                    Dataworker.update_task_list(Tokens.data_file_dir, task_list);

                    Printer.return_success();
                } else {
                    Printer.return_error('Invalid id!');
                }
            } else {
                Printer.return_error('Invalid id!');
            }
        }).catch(err => {
            // Try again
            Printer.return_error(err);
            Manager.remove_task(id)
        })
    }

    static async clear_list(list_name) {
        /* Clear list of tasks with <list_name> */

        if (list_name === 'all') {
            // Remove all tasks
            Dataworker.update_task_list(Tokens.data_file_dir, [])

            Printer.return_success()
        } else {
            let {'overdue_list': olist, 'task_list': tlist, 'note_list': nlist} = await Classifier.get_groups_of_tasks()
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
            Dataworker.update_task_list(Tokens.data_file_dir, list)

            Printer.return_success()
        }
    }

}

module.exports = Manager
