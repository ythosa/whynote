<br>

<div align="center">
  
  <img src="https://github.com/Ythosa/whynote/blob/master/assets/whynote.png">
  
  <br>
  
  <br>

  [![Badge](https://img.shields.io/badge/Uses-Node.js-green.svg?style=flat-square)](Node.js)
  [![Badge](https://img.shields.io/badge/Open-Source-important.svg?style=flat-square)](OpenSource)
  [![Badge](https://img.shields.io/badge/Made_with-Love-ff69b4.svg?style=flat-square)](MadeWithLove)

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
          *  `-t|--tasks` - output only tasks,
          *  `-o|--overdue` - output overdue task list;
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
          *  `<id1, id2, id3, ...>`
          *  `start-end` - using this syntax you can delete tasks from id peer `start` to id peer `end`;
       *  `--help|h`  -  get info about this method.
       
   *   #### Modification task:
       *  `note modific|mod <id>`,
       *  Via this command you can change task's with `id` _text_, _priority_ and _deadline_:
          * If you don't want to change task's properties, you can write in following prompts: `-`,
          * If you chosen note and added to it deadline, note's priority will be reset;
       *  `--help|h`.
    
   *   #### Clear some list:
       *  `note clear <list_name>`,
       *  Via this command you can clear the list with the name of the input list - `list_name`;
       *  `list name` can be: 
          * overdue-list  -  to clear overdue task list,
          * task-list  -  to clear task list,
          * note-list  -  to clear note-list
          * all  -  to clear all lists (== remove all func)
       *  `--help|h`.
   
<br>

  <div align = "center"> 
    <h2> :.Using Example.: </h2>
    <img src="https://github.com/Ythosa/whynote/blob/master/assets/using_example.gif">
  
   #### More you can see in `assets` folder of this repository.
  </div>

<br>

## FAQ
*Q*: How can I get help on some command?  
*A*: You can use command flag `--help|-h`, for example: `wis goto --help`

*Q*: How can I help to develop this project?  
*A*: You can put a :star: :3

<br>

<div align="center">
  Copyright 2020 Ythosa
</div>
