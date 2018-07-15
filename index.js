function TaskPaperContext (editor, options) {
  var ONE_DAY_IN_MS = 86400000;

  function getNextRepeatDate (stringRepeatValue, stringLastRepeatDate, repeatFromDone) {
    var stringDurationOffset = getStringDurationOffset(stringRepeatValue);
    var stringDateAnchor = getStringDateAnchor(stringRepeatValue, stringLastRepeatDate, repeatFromDone, stringDurationOffset);
    return addDurationOffset(stringDateAnchor, stringDurationOffset);
  }

  function getStringDurationOffset (stringRepeatValue) {
    if (isDurationOffsetRepeat(stringRepeatValue))
      return stringRepeatValue.slice(1);
    if (isNextDateRepeat(stringRepeatValue)) {
      var quantityDurationOffsetDays = (DateTime.parse('next ' + stringRepeatValue) - DateTime.parse('this ' + stringRepeatValue)) / ONE_DAY_IN_MS;
      if (6 < quantityDurationOffsetDays && quantityDurationOffsetDays < 8) // rough estimate to account for daylight savings
        return '1 week';
      if (20 < quantityDurationOffsetDays && quantityDurationOffsetDays < 40)
        return '1 month';
      if (quantityDurationOffsetDays > 360)
        return '1 year';
      return '1 day';
    }
    throw new Error('invalid repeat value');
  }

  function getStringDateAnchor (stringRepeatValue, stringLastRepeatDate, repeatFromDone, stringDurationOffset) {
    const stringNow = DateTime.format(new Date());
    if (isDurationOffsetRepeat(stringRepeatValue)) {
      if (repeatFromDone)
        return stringNow;
      return stringLastRepeatDate;
    }
    if (isNextDateRepeat(stringRepeatValue)) {
      return getNextDateAnchor(
        repeatFromDone ? stringNow : stringLastRepeatDate,
        stringRepeatValue,
        stringDurationOffset,
      );
    }
    throw new Error('invalid repeat value');
  }

  function getNextDateAnchor (maximumStringDate, stringRepeatValue, stringDurationOffset) {
    var maximumDate = DateTime.parse(maximumStringDate);
    var testDateAnchor = DateTime.parse('last ' + stringRepeatValue);
    // We want the anchor date just below (or equal to) the max.
    // Push date above, than just below.
    while (testDateAnchor.valueOf() < maximumDate.valueOf()) {
      testDateAnchor = addDurationOffset(DateTime.format(testDateAnchor), stringDurationOffset);
    }
    while (testDateAnchor.valueOf() > maximumDate.valueOf()) {
      testDateAnchor = subtractDurationOffset(DateTime.format(testDateAnchor), stringDurationOffset);
    }
    return DateTime.format(testDateAnchor);
  }

  function addDurationOffset (stringDateAnchor, stringDurationOffset) {
    // let DateTime do the addition to account for daylight savings
    return DateTime.parse(stringDateAnchor + ' +' + stringDurationOffset);
  }

  function subtractDurationOffset (stringDateAnchor, stringDurationOffset) {
    // let DateTime do the addition to account for daylight savings
    return DateTime.parse(stringDateAnchor + ' -' + stringDurationOffset);
  }

  function isDurationOffsetRepeat (stringDurationOffset) {
    return typeof stringDurationOffset === 'string' && stringDurationOffset[0] === '+' && DateTime.parse('today ' + stringDurationOffset) != null;
  }

  function isNextDateRepeat (stringDay) {
    return typeof stringDay === 'string' && stringDay.length && DateTime.parse('next ' + stringDay) != null;
  }

  function isDay (stringDay) {
    return typeof stringDay === 'string' && stringDay.length && DateTime.parse(stringDay) != null;
  }

  function assertIsDay (string, errorMessage) {
    if (!isDay(string))
      throw new Error(errorMessage);
  }

  function getNextDatesDue (stringRepeat, stringLastRepeatDate, repeatFromDone) {
    return stringRepeat.split(',').map(function (stringRepeatValue) {
      return getNextRepeatDate(stringRepeatValue, stringLastRepeatDate, repeatFromDone);
    });
  }

  function getEarliestNextRepeatDate (stringRepeat, stringLastRepeatDate, repeatFromDone) {
    var nextDatesDue = getNextDatesDue(stringRepeat, stringLastRepeatDate, repeatFromDone);
    if (!nextDatesDue.length)
      throw new Error('invalid repeat values');
    return new Date(Math.min.apply(null, nextDatesDue));
  }

  function getNextStringDueFromStart (stringStart, stringDue, nextStringStart) {
    var quantityMsDurationoffset = DateTime.parse(stringDue).valueOf() - DateTime.parse(stringStart).valueOf();
    // Hack to avoid parsing timezones if possible
    if (quantityMsDurationoffset === 0) {
      return nextStringStart;
    }
    var operator = quantityMsDurationoffset >= 0 ? '+' : '-';
    // TODO: this offsets by an hour when crossing daylight savings
    const nextDateDue = DateTime.parse(nextStringStart + ' ' + operator + Math.abs(quantityMsDurationoffset) + ' milliseconds');
    return DateTime.format(nextDateDue);
  }

  function createRepeatItem (item) {
    var newItem = item.clone(true);
    newItem.removeAttribute('data-done');
    newItem.descendants.forEach(function (descendantItem) {
      descendantItem.removeAttribute('data-done');
    });
    var stringRepeat = newItem.getAttribute('data-repeat');
    var stringStart = newItem.getAttribute('data-start');
    var stringDue = newItem.getAttribute('data-due');
    var repeatFromDone = newItem.getAttribute('data-repeat-from-done') != null;
    if (typeof stringStart !== 'string' && typeof stringDue !== 'string') {
      throw new Error('start or due required');
    }
    if (typeof stringStart === 'string') {
      assertIsDay(stringStart, 'invalid start date');
    }
      if (typeof stringDue === 'string') {
        assertIsDay(stringDue, 'invalid due date');
      }

    // If no start, infer that start is the same as due
    var inferredStringStart = typeof stringStart === 'string' ? stringStart : stringDue;
    var nextStringStart = DateTime.format(getEarliestNextRepeatDate(stringRepeat, inferredStringStart, repeatFromDone));
    if (typeof stringStart === 'string') {
      newItem.setAttribute('data-start', nextStringStart);
    }
    if (typeof stringDue === 'string') {
      var nextStringDue = getNextStringDueFromStart(inferredStringStart, stringDue, nextStringStart);
      newItem.setAttribute('data-due', nextStringDue);
    }
      return newItem;
    }

  function repeatAll () {
    editor.outline.groupUndoAndChanges(function () {
      editor.outline.items.forEach((item) => repeatUngrouped(item.id))
    });
  }

  function repeat (itemId) {
    editor.outline.groupUndoAndChanges(function () {
      repeatUngrouped(itemId);
    });
  }

  function repeatUngrouped (itemId) {
    var item = editor.outline.getItemForID(itemId);
    item.setAttribute('data-editing')
    if (item.getAttribute('data-repeat') == null || item.getAttribute('data-done') == null)
      return;
    try {
      item.parent.insertChildrenBefore(createRepeatItem(item), item);
      item.removeAttribute('data-repeat');
    } catch (err) {
      item.setAttribute('data-error', err.message)
    }
  }

  if (this.taskPaperRepeatDisposable)
    this.taskPaperRepeatDisposable.dispose();

  repeatAll();
  this.taskPaperRepeatDisposable = editor.outline.onDidChange(function (mutation) {
    var itemJustMarkedDone = mutation.type === Mutation.ATTRIBUTE_CHANGED &&
      mutation.attributeName === 'data-done' &&
      mutation.attributeOldValue == null;
    if (itemJustMarkedDone)
      repeat(mutation.target.id)
  });
};

if (typeof Application === 'function') {
  Application("TaskPaper").documents[0].evaluate({
    script: TaskPaperContext.toString()
  });
} else {
  module.exports = TaskPaperContext;
}
