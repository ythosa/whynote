const Dataworker = require('./dataworker');

class Tokens {

    static valid_priority_num = /^[1|2|3]$/;
    static valid_priority = /^[(inessential)|(average)|(important)]$/;
    static valid_deadline = /^(\d+)[-|\/|.](\d+)( (\d+)\:(\d{2}))?$/;

    static valid_task_id_nums = /^\d+$/;
    static valid_task_id_interval = /^(\d+)-(\d+)$/;

    static output_colors_name = [
        'inessential',
        'average',
        'important',
    ]
    static output_colors = {
        important: {
            text: {r: 250, g: 250, b: 250},
            bg: {r: 141, g: 127, b: 210},
        },
        average: {
            text: {r: 93, g: 85, b: 190},
            bg: {r: 250, g: 250, b: 250},
        },
        inessential: {
            text: {r: 211, g: 201, b: 237},
            bg: null,
        },
        primary: {r: 211, g: 201, b:237},
    };

    static data_file_dir = Dataworker.take_data_file_dir();

    static max_list_length = 30;

    static lists_names = /^(overdue-list)|(task-list)|(note-list)$/;

    static validation_deadline(task_deadline) {
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

}

module.exports = Tokens;
