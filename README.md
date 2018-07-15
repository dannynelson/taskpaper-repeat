# TaskPaper Repeat Script [![Build Status](https://travis-ci.org/dannynelson/taskpaper-repeat.svg?branch=master)](https://travis-ci.org/dannynelson/taskpaper-repeat)
A script for managing recurring tasks in [TaskPaper 3](https://www.taskpaper.com/). After running the script, whenever a task with a `@repeat` value is marked `@done`, the script immediately duplicates the task and increments the `@start` and `@due` dates.

## Usage
Download the [latest release `repeat.scpt` file](https://github.com/dannynelson/taskpaper-repeat/releases), and [install it in TaskPaper's Command Pallet](https://guide.taskpaper.com/using-taskpaper/using-scripts.html).

You can [run the script manually](https://guide.taskpaper.com/using-taskpaper/using-scripts.html) or run the script automatically when TaskPaper launches using a tool like [Alfred](https://www.alfredapp.com/workflows/) or [Keyboard Maestro](http://www.keyboardmaestro.com/main/).

### @repeat
Add a `@start` and/or `@due` date, and a `@repeat` value to your recurring task. The `@repeat` value can be:
- the next date - e.g. `Wednesday`, `June 3`, `Nov 26 8:15`
- the next dates, separated by comma - e.g. `Monday,Wednesday,Friday`
- a duration offset from the last start/due date - e.g. `+6 hours`, `+3 day`, `+1 month`

```
- repeat next March 20th at 7pm @due(2018-03-15 19:00) @repeat(March 20 7pm)
- repeat every weekday @start(2018-03-20) @repeat(Monday,Tuesday,Wednesday,Thursday,Friday)
- repeat 2 weeks after the start date @start(2018-03-15) @due(2018-03-20) @repeat(+2 weeks)
```
See the [TaskPaper dates guide](https://guide.taskpaper.com/reference/dates/) for more info on date formats.

### @repeat-from-done
By default, new repeat dates anchor from `@start` / `@due`. Add the `@repeat-from-done` tag if you want to repeat from completion date instead.

```
- repeat 1 week after completion @due(2018-11-11) @repeat(+1 week) @repeat-from-done
- repeat the Monday after completion @start(2018-11-11) @repeat(Monday) @repeat-from-done
```
