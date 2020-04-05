/* Saving and Updating Data File */

const fs = require('fs')

class DataWorker {

    static get_tasks(data_dir) {
        /* Get task list from json file */
        let task_list = fs.readFileSync(`${data_dir}`, "utf8");
        task_list = JSON.parse(task_list);
        return task_list;
    }

    static add_task(data_dir, task) {
        let task_list = DataWorker.get_tasks(data_dir);
        task_list = [
            ...task_list,
            task
        ]
        task_list = JSON.stringify(task_list, null, '   ');
        fs.writeFileSync(data_dir, task_list, "utf8");
    }
}

module.exports = DataWorker;
