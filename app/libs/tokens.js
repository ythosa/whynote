const Dataworker = require('./dataworker');

const Tokens = {

    cli_commands: [
        ['clear', 'cl'],
        ['modific', 'mod'],
        ['remove', 'rv'],
        ['add-note', 'an'],
        ['add-task', 'at'],
        ['list', 'l'],
    ],

    valid_priority_num: /^[1|2|3]$/,
    valid_priority: /^[(inessential)|(average)|(important)]$/,
    valid_deadline: /^(\d+)[-|\/|.](\d+)( (\d+)\:(\d{2}))?$/,

    valid_task_id_nums: /^(\d+,?)+$/,
    valid_task_id_interval: /^(\d+)-(\d+)$/,

    output_colors_name: [
        'inessential',
        'average',
        'important',
    ],

    output_colors: {
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
        primary: {r: 211, g: 201, b: 237},
    },

    data_file_dir: Dataworker.take_data_file_dir(),

    max_list_length: 30,

    lists_names: /^(overdue-list)|(task-list)|(note-list)|(all)$/,

    validation_deadline: (task_deadline) => {
        /* Checking whether the deadline is correct */
        let is_deadline_correct = Tokens.valid_deadline.test(task_deadline);
        let reason_of_error;

        let date = new Date();
        let year, month, day, hours, minutes;
        if (is_deadline_correct) {
            day = task_deadline.replace(Tokens.valid_deadline, '$1');
            if (day <= 0 || day >= 32) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s day input!';
            }

            month = task_deadline.replace(Tokens.valid_deadline, '$2') - 1;
            if (month <= -1 || month >= 12) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s month input!';
            }

            year = date.getUTCFullYear();

            hours = task_deadline.replace(Tokens.valid_deadline, '$4');
            if (hours == '') hours = null;
            if (hours != null && (hours <= -1 || hours >= 23)) {
                is_deadline_correct = false;
                reason_of_error = 'Ivalid deadline\'s hours input!';
            }

            minutes = task_deadline.replace(Tokens.valid_deadline, '$5');
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
    },

    levenshteinDistance: (a, b) => {
        // Create empty edit distance matrix for all possible modifications of
        // substrings of a to substrings of b.
        const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        // Fill the first row of the matrix.
        // If this is first row then we're transforming empty string to a.
        // In this case the number of transformations equals to size of a substring.
        for (let i = 0; i <= a.length; i += 1) {
            distanceMatrix[0][i] = i;
        }

        // Fill the first column of the matrix.
        // If this is first column then we're transforming empty string to b.
        // In this case the number of transformations equals to size of b substring.
        for (let j = 0; j <= b.length; j += 1) {
            distanceMatrix[j][0] = j;
        }

        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                distanceMatrix[j][i] = Math.min(
                    distanceMatrix[j][i - 1] + 1, // deletion
                    distanceMatrix[j - 1][i] + 1, // insertion
                    distanceMatrix[j - 1][i - 1] + indicator, // substitution
                );
            }
        }

        return distanceMatrix[b.length][a.length];
    }
}

module.exports = Tokens;
