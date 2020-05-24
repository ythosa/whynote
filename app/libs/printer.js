const chalk = require('chalk');
const Tokens = require('./tokens');

class Printer {

    static print_blank_line(text) {
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

    static return_error(e) {
        /* Return Error Template */
        let text = `   Error! ${e}`;
        console.log();
        Printer.print_blank_line(text);
        console.log(chalk.redBright(text));
        Printer.print_blank_line(text);
    }

    static return_warning(w) {
        /* Return Warning Template */
        let text = `    Warning! ${w}`;
        console.log();
        Printer.print_blank_line(text);
        console.log(chalk.yellowBright(text));
        Printer.print_blank_line(text);
    }

    static return_success() {
        /* Return Success of Operation */
        let text = `    Success! `;
        console.log();
        Printer.print_blank_line(text);
        console.log(chalk.greenBright(text));
        Printer.print_blank_line(text);
    }

    static print_similar_commands(cmds) {
        /* Print Similar CLI Commands */
        console.log()

        const { r, g, b } = Tokens.output_colors.inessential.text

        if (cmds.length > 1)
            console.log(chalk.rgb(r, g, b)(`The most similar commands are: `))
        else
            console.log(chalk.rgb(r, g, b)(`The most similar command is: `))

        for (let c of cmds) {
            console.log(`\t ${c.command} ( ${c.alias} )`)
        }

        console.log()
    }

    static print_note(id, task, color) {
        /* Print Task With Correct Selection */
        let {r, g, b} = Tokens.output_colors.primary;
        id++;
        let id_str = Printer.id_num2str(id)

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

    static getMonthFromNumber(mon){
        /* Getting month's name string from month's number id */
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[mon]
    }

    static dayNumberToString(day) {
        /* Formatting ordinal numbers for a date */
        let last_num = day % 10;
        if (last_num === 1) {
            day = `${day}'st`
        } else if (last_num === 2) {
            day = `${day}'nd`
        } else if (last_num === 3) {
            day = `${day}'rd`
        } else {
            day = `${day}'th`
        }
        return day
    }

    static id_num2str(id) {
        let id_str = '';
        if (id < 10) {
            id_str = `0${id}`;
        } else {
            id_str = `${id}`;
        }
        return id_str
    }

    static print_task_list(tlist, id_t) {
        for (let t_month in tlist) {
            let {r, g, b} = Tokens.output_colors.primary;
            let color = Tokens.output_colors.important;
            // Print mounth of group of tasks
            console.log(chalk.rgb(r, g, b)('· ') +
                chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                (` ${Printer.getMonthFromNumber(tlist[t_month].month)} `) + chalk.rgb(r, g, b)(':'))
            for (let t_day in tlist[t_month].tasks) {
                color = Tokens.output_colors.average;
                let day_format_string = Printer.dayNumberToString(tlist[t_month].tasks[t_day].day)
                // Print day of group of tasks
                console.log(
                    chalk.rgb(r, g, b)(`·· `) +
                    chalk.bgRgb(color.bg.r, color.bg.g, color.bg.b).rgb(color.text.r, color.text.g, color.text.b)
                    (` by the ${day_format_string} `) +
                    chalk.rgb(r, g, b)(':')
                );
                // Print tasks for this day
                tlist[t_month].tasks[t_day].tasks.forEach(task => {
                    let id_str = Printer.id_num2str(id_t);
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
}

module.exports = Printer;
