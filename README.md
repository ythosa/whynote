<br>

<div align="center">
  
  <img src="https://github.com/Ythosa/whynote/blob/master/docs_res/whynote.png">
  
  <br>

  [![Badge](https://img.shields.io/badge/Uses-Node.js-green.svg?style=flat-square)](1)
  [![Badge](https://img.shields.io/badge/Open-Source-important.svg?style=flat-square)](1)
  [![Badge](https://img.shields.io/badge/Made_with-Love-ff69b4.svg?style=flat-square)](1)

  <br>

</div>

## Installation:
-   Install [Node.js](https://nodejs.org/en/),
-   Clone this repo: `git clone https://github.com/Ythosa/whynote`,
-   Install dependences by writing in console: `npm install`,
-   Setup module by writing in console: `npm link --force`,
-   Done, you can use it from your `cmd`.

<br>

## Description:
-    Command line task manager and notebook;
-    `whynote` is easy way to mark tasks, which need to be completed;
-    It is easy to install and easy to use;
-    It has great functionality.

<br>

<h2 align="center"> :.Documentation.: </h2>

###   Whynote's Commands:

   *   #### Get _whynote_ help:
       *  `note --help|-h [command]`.
       
   *   #### Get _whynote_ version:
       *  `note --version|-V`.
       
   *   #### Get list of tasks and/or notes:
       *  `note list|l [options] `,
       *  Options could be:
          *  `-n|--notes` flag carries out a output only notes,
          *  `-t|--tasks` - output only tasks;
       *  `--help|h`  -  get info about this function.
       
   *   #### Adding task to task list:
       *  `note add-task|at`,
       *  You will need to enter:
          * Task's text,
          * Task's deadline, format is  `DD.MM [hh:mm]`;
       *  `--help|h` flag exists to get info about this function.
       
   *   #### Adding note to note list:
       *  `note add-note|an`,
       *  You will need to enter:
          * Note's text,
          * Note's priority, that could be `important` or `3`, `average` or `2`, `inessental` or `1`;
       *  `--help|h` flag exists to get info about this function.
   
   *   #### Removing task:
       *  `note remove|rv <id>`,
       *  Removing task from task list with id,
       *  Id can be:
          * `all`, by this way you can remove all tasks from task list,
          *  `<id>` number of task number in task list,
          *  `start-end` - using this syntax you can delete tasks from id peer `start` to id peer `end`;
       *  `--help|h`  -  get info about this method.
       
   *   #### Modification task:
       *  `note modific|mod <id>`,
       *  Via this command you can change task's with `id` _text_, _priority_ and _deadline_:
          * If you don't want to change task's properties, you can write in following prompts: `-`,
          * If you chosen note and added to it deadline, note's priority will be reset;
       *  `--help|h`.
   
<br>

###   Using Example:
  <div align = "center"> 
    <img src="https://github.com/Ythosa/whynote/blob/master/docs_res/using_example.gif">
  
   #### More you can see in `docs_res` folder of this repository
  </div>
