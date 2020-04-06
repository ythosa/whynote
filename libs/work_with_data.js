/* Saving and Updating Data File */

const fs = require('fs')

class DataWorker {

    static get_tasks(data_dir, sort_type) {
        /* Get Task List from json File */
        let task_list = fs.readFileSync(`${data_dir}`, "utf8");
        task_list = JSON.parse(task_list);
        
        // If we need sort list
        if (sort_type != 'last') {
            // Sorting getted task list
            if (sort_type == 'date')
                task_list = task_list.sort((t1, t2) => t1['date'] - t2['date'])
            else    
                task_list = task_list.sort((t1, t2) => t2['priority'] - t1['priority']); 
            // Update data file
            this.update_task_list(data_dir, task_list)
        }

        return task_list
    }

    static add_task(data_dir, task) {
        /* Add Task to Data File */
        let task_list = DataWorker.get_tasks(data_dir);
        // Update task list
        task_list = [
            ...task_list,
            task
        ]
        task_list = JSON.stringify(task_list, null, '   ');
        fs.writeFileSync(data_dir, task_list, "utf8");
    }

    static update_task_list(data_dir, task_list) {
        /* Updating Task List in Data File */
        task_list = JSON.stringify(task_list, null, '   ');
        fs.writeFileSync(data_dir, task_list, "utf8");
    }
}

module.exports = DataWorker;
