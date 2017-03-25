# TaskPaper Repeat Script [![Build Status](https://travis-ci.org/dannynelson/taskpaper-repeat.svg?branch=master)](https://travis-ci.org/dannynelson/taskpaper-repeat)
A script for managing recurring tasks in [TaskPaper 3](https://www.taskpaper.com/). Whenever a task with a `@repeat` value is marked `@done`, the script immediately duplicates the task and increments the `@start` and `@due` dates.

## Usage
Download the [latest release `repeat.scpt` file](https://github.com/dannynelson/taskpaper-repeat/releases), and [install it in TaskPaper's Command Pallet](https://guide.taskpaper.com/using-taskpaper/using-scripts.html).

Add a `@start` and/or `@due` date, and a `@repeat` value to your recurring task. The `@repeat` value can be:
- the next day/time - e.g. `Wednesday`, `June 3`, `Nov 26 3:15`
- the next days/times, separated by comma - e.g. `Monday 8:00,Wednesday 8:00,Friday 8:00`
- a duration offset from the last start/due date - e.g. `+6 hours`, `+3 day`, `+1 month`

For example:
```
- repeat next March 11th at 7pm @due(2018-03-15 19:00) @repeat(March 11 7pm)
- repeat every weekday @start(2018-03-20) @repeat(Monday,Tuesday,Wednesday,Thursday,Friday)
- repeat 2 weeks after the start date @start(2018-03-15) @due(2018-03-20) @repeat(+2 weeks)
```

See the [TaskPaper 3 dates guide](https://guide.taskpaper.com/reference/dates/) for all available date options.

You can [run the script manually](https://guide.taskpaper.com/using-taskpaper/using-scripts.html) or run the script on TaskPaper launch using a tool like [Alfred](https://www.alfredapp.com/workflows/) or [Keyboard Maestro](http://www.keyboardmaestro.com/main/). After running the script, whenever a `@repeat` task is marked `@done`, the script immediately duplicates the task and updates the `@start` and `@due` dates.
