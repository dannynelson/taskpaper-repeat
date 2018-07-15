const {describe, it, beforeEach} = require('mocha');
const _ = require('lodash');
const birch = require('birch-outline');
const moment = require('moment');
const assert = require('assert');
const lolex = require('lolex');

const TaskPaperContext = require('.');

global.DateTime = birch.DateTime;
global.Mutation = birch.Mutation;
const DAY_BEFORE_DAYLIGHT_SAVINGS = '2017-03-11';

describe('TaskPaper repeat script', function () {
  describe('next date repeat', function () {
    ['data-start', 'data-due'].forEach((dateType) => {
      describe(`with "${dateType}"`, function () {
        testRepeats([
          {
            description: 'repeats next "Monday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday'},
            outputAttributes: {[dateType]: '2017-03-13', 'data-repeat': 'Monday'},
          },
          {
            description: 'repeats next "Tuesday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Tuesday'},
            outputAttributes: {[dateType]: '2017-03-14', 'data-repeat': 'Tuesday'},
          },
          {
            description: 'repeats next "Wednesday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Wednesday'},
            outputAttributes: {[dateType]: '2017-03-15', 'data-repeat': 'Wednesday'},
          },
          {
            description: 'repeats next "Thursday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Thursday'},
            outputAttributes: {[dateType]: '2017-03-16', 'data-repeat': 'Thursday'},
          },
          {
            description: 'repeats next "Friday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Friday'},
            outputAttributes: {[dateType]: '2017-03-17', 'data-repeat': 'Friday'},
          },
          {
            description: 'repeats next "Saturday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Saturday'},
            outputAttributes: {[dateType]: '2017-03-18', 'data-repeat': 'Saturday'},
          },
          {
            description: 'repeats next "Sunday"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Sunday'},
            outputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'Sunday'},
          },
          {
            description: 'repeats next "March 1"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'March 1'},
            outputAttributes: {[dateType]: '2018-03-01', 'data-repeat': 'March 1'},
          },
          {
            description: 'repeats next "April 25 8:00"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'April 25 8:00'},
            outputAttributes: {[dateType]: '2017-04-25 08:00', 'data-repeat': 'April 25 8:00'},
          },
          {
            description: 'repeats next "day"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'day'},
            outputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'day'},
          },
          {
            description: 'repeats next "week"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'week'},
            outputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'week'},
          },
          {
            description: 'repeats next "month"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'month'},
            outputAttributes: {[dateType]: '2017-04-01', 'data-repeat': 'month'},
          },
          {
            description: 'repeats next "year"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'year'},
            outputAttributes: {[dateType]: '2018-01-01', 'data-repeat': 'year'},
          },
          {
            description: 'repeats when completed early',
            currentDate: '2017-02-12',
            inputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'Monday'},
            outputAttributes: {[dateType]: '2017-03-13', 'data-repeat': 'Monday'},
          },
          {
            description: 'repeats when completed late',
            currentDate: '2017-04-12',
            inputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'Monday'},
            outputAttributes: {[dateType]: '2017-03-13', 'data-repeat': 'Monday'},
          },
          {
            description: 'repeats from done when completed early',
            currentDate: '2017-02-12',
            inputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'Monday', 'data-repeat-from-done': ''},
            outputAttributes: {[dateType]: '2017-02-13', 'data-repeat': 'Monday', 'data-repeat-from-done': ''},
          },
          {
            description: 'repeats from done when completed late',
            currentDate: '2017-04-12',
            inputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'Monday', 'data-repeat-from-done': ''},
            outputAttributes: {[dateType]: '2017-04-17', 'data-repeat': 'Monday', 'data-repeat-from-done': ''},
          },
        ]);
      });
    })
  });

  describe('next multi-date repeat', function () {
    ['data-start', 'data-due'].forEach((dateType) => {
      describe(`with "${dateType}"`, function () {
        testRepeats([
          {
            description: 'repeats next "Monday,Wednesday,Friday" to Monday',
            currentDate: '2017-03-12',
            inputAttributes: {[dateType]: '2017-03-12', 'data-repeat': 'Monday,Wednesday,Friday'},
            outputAttributes: {[dateType]: '2017-03-13', 'data-repeat': 'Monday,Wednesday,Friday'},
          },
          {
            description: 'repeats next "Monday,Wednesday,Friday" to Wednesday',
            currentDate: '2017-03-14',
            inputAttributes: {[dateType]: '2017-03-13', 'data-repeat': 'Monday,Wednesday,Friday'},
            outputAttributes: {[dateType]: '2017-03-15', 'data-repeat': 'Monday,Wednesday,Friday'},
          },
          {
            description: 'repeats next "Monday,Wednesday,Friday" to Friday',
            currentDate: '2017-03-16',
            inputAttributes: {[dateType]: '2017-03-15', 'data-repeat': 'Monday,Wednesday,Friday'},
            outputAttributes: {[dateType]: '2017-03-17', 'data-repeat': 'Monday,Wednesday,Friday'},
          },
          {
            description: 'with spaces after commas',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday, Wednesday, Friday'},
            outputAttributes: {[dateType]: '2017-03-13', 'data-repeat': 'Monday, Wednesday, Friday'},
          },
        ]);
      });
    });
  });

  describe('duration offset repeat', function () {
    ['data-start', 'data-due'].forEach((dateType) => {
      describe(`with "${dateType}"`, function () {
        testRepeats([
          {
            description: 'repeats "+1 day"',
            currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '+1 day'},
            outputAttributes: {[dateType]: '2017-03-12', 'data-repeat': '+1 day'},
          },
          {
            description: 'repeats "+1 day" with time',
            currentDate: '2017-03-11 07:00',
            inputAttributes: {[dateType]: '2017-03-11 7:00', 'data-repeat': '+1 day'},
            outputAttributes: {[dateType]: '2017-03-12 07:00', 'data-repeat': '+1 day'},
          },
          {
            description: 'repeats "+2 weeks"',
            currentDate: '2017-03-15',
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '+2 weeks'},
            outputAttributes: {[dateType]: '2017-03-25', 'data-repeat': '+2 weeks'},
          },
          {
            description: 'repeats "+3 months"',
            currentDate: '2017-03-15',
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '+3 months'},
            outputAttributes: {[dateType]: '2017-06-11', 'data-repeat': '+3 months'},
          },
          {
            description: 'repeats "+1 year"',
            currentDate: '2017-03-15',
            inputAttributes: {[dateType]: DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '+1 year'},
            outputAttributes: {[dateType]: '2018-03-11', 'data-repeat': '+1 year'},
          },
          {
            description: 'repeats from done',
            currentDate: '2017-03-01 06:00',
            inputAttributes: {[dateType]: '2017-03-02', 'data-repeat': '+1 week', 'data-repeat-from-done': ''},
            outputAttributes: {[dateType]: '2017-03-08 06:00', 'data-repeat': '+1 week', 'data-repeat-from-done': ''},
          },
        ]);
      });
    });
  });

  describe('task with "data-start" and "data-due"', function () {
    testRepeats([
      {
        description: '"data-start" before "data-due"',
        currentDate: '2017-03-15',
        inputAttributes: {'data-start': '2017-03-15', 'data-due': '2017-03-18', 'data-repeat': '+1 week'},
        outputAttributes: {'data-start': '2017-03-22', 'data-due': '2017-03-25', 'data-repeat': '+1 week'},
      },
      {
        description: '"data-start" after "data-due"',
        currentDate: '2017-03-15',
        inputAttributes: {'data-start': '2017-03-18', 'data-due': '2017-03-15', 'data-repeat': '+1 week'},
        outputAttributes: {'data-start': '2017-03-25', 'data-due': '2017-03-22', 'data-repeat': '+1 week'},
      },
      {
        description: 'repeats with correct times',
        currentDate: '2017-03-15',
        inputAttributes: {'data-start': '2017-03-15 08:00', 'data-due': '2017-03-18 10:00', 'data-repeat': '+1 week'},
        outputAttributes: {'data-start': '2017-03-22 08:00', 'data-due': '2017-03-25 10:00', 'data-repeat': '+1 week'},
      },
      // {
      //   description: 'FIXME: offsets by an hour when crossing daylight savings',
      //   currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
      //   inputAttributes: {'data-start': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-due': '2017-03-13', 'data-repeat': '+1 week'},
      //   outputAttributes: {'data-start': '2017-03-18', 'data-due': '2017-03-20', 'data-repeat': '+1 week'},
      // },
    ]);
  });

  describe('bad inputs', function () {
    testInvalidRepeats([
      {
        description: 'no repeat value',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': ''},
        outputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '', 'data-error': 'invalid repeat value'},
      },
      {
        description: 'partial duration',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '+'},
        outputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '+', 'data-error': 'invalid repeat value'},
      },
      {
        description: 'negative duration',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '-1 day'},
        outputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': '-1 day', 'data-error': 'invalid repeat value'},
      },
      {
        description: 'day typo',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Wensday'},
        outputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Wensday', 'data-error': 'invalid repeat value'},
      },
      {
        description: 'extra comma',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday,,Wednesday'},
        outputAttributes: {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday,,Wednesday', 'data-error': 'invalid repeat value'},
      },
      {
        description: 'invalid due date',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-due': 'foobar', 'data-repeat': 'Monday'},
        outputAttributes: {'data-due': 'foobar', 'data-repeat': 'Monday', 'data-error': 'invalid due date'},
      },
      {
        description: 'invalid start date',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-start': 'foobar', 'data-repeat': 'Monday'},
        outputAttributes: {'data-start': 'foobar', 'data-repeat': 'Monday', 'data-error': 'invalid start date'},
      },
      {
        description: 'no "data-start" or "data-due"',
        currentDate: DAY_BEFORE_DAYLIGHT_SAVINGS,
        inputAttributes: {'data-repeat': 'Monday'},
        outputAttributes: {'data-repeat': 'Monday', 'data-error': 'start or due required'},
      },
    ]);
  });

  it('does not repeat if removing done attribute', function () {
    const clock = lolex.install(moment(DAY_BEFORE_DAYLIGHT_SAVINGS).toDate());
    const outline = createOutlineAndRunScript();
    const item = createItem(outline, {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday', 'data-done': ''});
    outline.root.appendChildren(item);
    item.removeAttribute('data-done');
    assert.equal(1, outline.items.length);
    clock.uninstall();
  });

  it('repeats tasks that have subtasks', function () {
    const clock = lolex.install(moment(DAY_BEFORE_DAYLIGHT_SAVINGS).toDate());
    const outline = createOutlineAndRunScript();
    const item = createItem(outline, {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday'});
    item.appendChildren(createItem(outline, {'data-done': ''}))
    outline.root.appendChildren(item);
    item.setAttribute('data-done', '');
    assert.equal(4, outline.items.length);
    assertItemAttributes(outline.items[0], {'data-due': '2017-03-13', 'data-repeat': 'Monday'});
    assert.equal(1, outline.items[0].children.length);
    assert.equal(undefined, outline.items[0].children[0].getAttribute('data-done'));
    clock.uninstall();
  });

  it('cleans up previous script listeners', function () {
    const clock = lolex.install(moment(DAY_BEFORE_DAYLIGHT_SAVINGS).toDate());
    const outline = createOutlineAndRunScript();
    TaskPaperContext({outline});
    TaskPaperContext({outline});
    const item = createItem(outline, {'data-due': DAY_BEFORE_DAYLIGHT_SAVINGS, 'data-repeat': 'Monday'});
    outline.root.appendChildren(item);
    item.setAttribute('data-done', '');
    assert.equal(2, outline.items.length);
    clock.uninstall();
  });
});

function testRepeats (inputs) {
  inputs.forEach(({description, currentDate, inputAttributes, outputAttributes}) => {
    it(description, function () {
      const clock = lolex.install(moment(currentDate).toDate());
      const outline = createOutlineAndRunScript();
      const item = createItem(outline, inputAttributes);
      outline.root.appendChildren(item);
      item.setAttribute('data-done', '');
      assert.equal(2, outline.items.length);
      assertItemAttributes(outline.items[0], outputAttributes);
      assertItemAttributes(outline.items[1], _.omit(inputAttributes, 'data-repeat'));
      assert.equal(outline.items[1].getAttribute('data-repeat'), undefined)
      clock.uninstall();
    });
  })
}

function testInvalidRepeats (inputs) {
  inputs.forEach(({description, currentDate, inputAttributes, outputAttributes}) => {
    it(description, function () {
      const clock = lolex.install(moment(currentDate).toDate());
      const outline = createOutlineAndRunScript();
      const item = createItem(outline, inputAttributes);
      outline.root.appendChildren(item);
      item.setAttribute('data-done', '');
      assert.equal(1, outline.items.length);
      assertItemAttributes(outline.items[0], outputAttributes);
      clock.uninstall();
    });
  })
}

function assertItemAttributes (item, attributes) {
  Object.keys(attributes).forEach((attributeName) => {
    assert.equal(item.getAttribute(attributeName), attributes[attributeName])
  })
}

function createItem (outline, inputAttributes) {
  const item = outline.createItem('- test');
  Object.keys(inputAttributes).forEach((attributeName) => {
    item.setAttribute(attributeName, inputAttributes[attributeName])
  })
  return item;
}

function createOutlineAndRunScript () {
  const outline = new birch.Outline.createTaskPaperOutline();
  TaskPaperContext({outline});
  return outline;
}
