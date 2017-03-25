function TaskPaperContext (editor, options) {
  var ONE_DAY_IN_MS = 86400000;

  function getNextRepeatDate (stringRepeatValue, stringLastRepeatDate) {
    var stringDurationOffset = getStringDurationOffset(stringRepeatValue);
    var stringDateAnchor = getStringDateAnchor(stringRepeatValue, stringLastRepeatDate);
    return getNextRepeatDateForInputs(stringDateAnchor, stringDurationOffset, stringLastRepeatDate);
  }

  function getStringDurationOffset (stringRepeatValue) {
    if (isDurationOffsetRepeat(stringRepeatValue))
      return stringRepeatValue.slice(1);
    if (isDateRepeat(stringRepeatValue)) {
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

  function getStringDateAnchor (stringRepeatValue, stringLastRepeatDate) {
    if (isDurationOffsetRepeat(stringRepeatValue))
      return stringLastRepeatDate;
    if (isDateRepeat(stringRepeatValue))
      return 'last ' + stringRepeatValue;
    throw new Error('invalid repeat value');
  }

  function getNextRepeatDateForInputs (stringDateAnchor, stringDurationOffset, stringLastRepeatDate) {
    var dateMinimum = getDateMinimum(stringLastRepeatDate);
    var dateNew = addDurationOffset(stringDateAnchor, stringDurationOffset);
    while (dateNew.valueOf() <= dateMinimum.valueOf()) {
      dateNew = addDurationOffset(DateTime.format(dateNew), stringDurationOffset);
    }
    return dateNew;
  }

  function addDurationOffset (stringDateAnchor, stringDurationOffset) {
    // let DateTime do the addition to account for daylight savings
    return DateTime.parse(stringDateAnchor + ' +' + stringDurationOffset);
  }

  function getDateMinimum (stringLastRepeatDate) {
    var msToday = DateTime.parse('today').valueOf();
    var msLastRepeat = DateTime.parse(stringLastRepeatDate).valueOf();
    return new Date(Math.max(msToday, msLastRepeat));
  }

  function isDurationOffsetRepeat (stringDurationOffset) {
    return typeof stringDurationOffset === 'string' && stringDurationOffset[0] === '+' && DateTime.parse('today ' + stringDurationOffset) != null;
  }

  function isDateRepeat (stringDay) {
    return typeof stringDay === 'string' && stringDay.length && DateTime.parse('next ' + stringDay) != null;
  }

  function isDay (stringDay) {
    return typeof stringDay === 'string' && stringDay.length && DateTime.parse(stringDay) != null;
  }

  function assertIsDay (string, errorMessage) {
    if (!isDay(string))
      throw new Error(errorMessage);
  }

  function getNextDatesDue (stringRepeat, stringLastRepeatDate) {
    return stringRepeat.split(',').map(function (stringRepeatValue) {
      return getNextRepeatDate(stringRepeatValue, stringLastRepeatDate);
    });
  }

  function getEarliestNextRepeatDate (stringRepeat, stringLastRepeatDate) {
    var nextDatesDue = getNextDatesDue(stringRepeat, stringLastRepeatDate);
    if (!nextDatesDue.length)
      throw new Error('invalid repeat values');
    return new Date(Math.min.apply(null, nextDatesDue));
  }

  function getNextDateDueFromStart (stringStart, stringDue, nextStringStart) {
    var quantityMsDurationoffset = DateTime.parse(stringDue).valueOf() - DateTime.parse(stringStart).valueOf();
    var operator = quantityMsDurationoffset >= 0 ? '+' : '-';
    // FIXME: this offsets by an hour when crossing daylight savings
    return DateTime.parse(nextStringStart + ' ' + operator + Math.abs(quantityMsDurationoffset) + ' milliseconds');
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
    if (typeof stringStart === 'string') {
      assertIsDay(stringStart, 'invalid start date');
      var nextStringStart = DateTime.format(getEarliestNextRepeatDate(stringRepeat, stringStart));
      newItem.setAttribute('data-start', nextStringStart);
      if (typeof stringDue === 'string') {
        assertIsDay(stringDue, 'invalid due date');
        var nextDateDue = getNextDateDueFromStart(stringStart, stringDue, nextStringStart);
        newItem.setAttribute('data-due', DateTime.format(nextDateDue));
      }
      return newItem;
    }
    if (typeof stringDue === 'string') {
      assertIsDay(stringDue, 'invalid due date');
      newItem.setAttribute('data-due', DateTime.format(getEarliestNextRepeatDate(stringRepeat, stringDue)));
      return newItem;
    }
    throw new Error('start or due required');
  }

  function repeat (itemId) {
    editor.outline.groupUndoAndChanges(function () {
      var item = editor.outline.getItemForID(itemId);
      if (item.getAttribute('data-repeat') == null || item.getAttribute('data-done') == null)
        return;
      try {
        item.parent.insertChildrenBefore(createRepeatItem(item), item);
      } catch (err) {
        item.setAttribute('data-repeat', 'Error: ' + err.message)
      }
    });
  }

  if (this.taskPaperRepeatDisposable)
    this.taskPaperRepeatDisposable.dispose();

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
