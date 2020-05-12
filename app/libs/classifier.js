const Dataworker = require('./dataworker');
const Tokens = require('./tokens');
const Printer = require('./printer');

class Classifier {

    static async get_groups_of_tasks() {
        /* Return tasks by groups: notes, tasks, overdue tasks */
        let task_list;
        try {
            task_list = await Dataworker.get_tasks(Tokens.data_file_dir)
        } catch(err) {
            Printer.return_error(err);
            await Classifier.get_groups_of_tasks();
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

        task_list = Classifier.sorting_tasks_with_dl(tlist);
        task_list = Classifier.classification_task_list(task_list);

        olist = task_list.overdue_tasks.tasks;
        tlist = task_list.valid_tasks.tasks;

        return {
            'overdue_list': olist,
            'task_list': tlist,
            'note_list': nlist
        }
    }

    static classification_task_list(tasks) {
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
                    if (classified_tasks[t_month_id].month == month) {
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
                                'tasks': [task]
                            }
                        ]
                    }
                )
            } else {
                let is_date_exist = false;

                let t_day_id;
                for (t_day_id in classified_tasks[t_month_id].tasks)
                    if (classified_tasks[t_month_id].tasks[t_day_id].day == day) {
                        is_date_exist = true;
                        break;
                    }
                if (!is_date_exist) {
                    classified_tasks[t_month_id].tasks.push(
                        {
                            'day': day,
                            'tasks': [task]
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

    static sorting_tasks_with_dl(task_list) {
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

}

module.exports = Classifier;
