/* Saving and Updating Data File */

const fs = require('fs')

class DataWorker {

    static get_tasks(data_dir, sort_type) {
        /* Get task list from json file */
        let task_list = fs.readFileSync(`${data_dir}`, "utf8");
        task_list = JSON.parse(task_list);

        // Sorting getted task list
        if (sort_type == 'date')
            task_list = task_list.sort((t1, t2) => t1['date'] - t2['date'])
        else    
            task_list = task_list.sort((t1, t2) => t2['priority'] - t1['priority']); 
        // Update data file
        fs.writeFileSync(data_dir, JSON.stringify(task_list, null, '   '), "utf8");

        return task_list
    }

    static add_task(data_dir, task) {
        /* Add task to data file */
        let task_list = DataWorker.get_tasks(data_dir);
        // Update task list
        task_list = [
            ...task_list,
            task
        ]
        task_list = JSON.stringify(task_list, null, '   ');
        fs.writeFileSync(data_dir, task_list, "utf8");
    }
}

module.exports = DataWorker;
