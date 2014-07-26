define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'util/DateTimeUtil',
  'text!view/form/fields/templates/Calendar.html'
], function($, _, Backbone, Handlebars, moment, Plumage, Field, DateTimeUtil, template) {

  return Plumage.view.form.fields.Calendar = Field.extend(
  /** @lends Plumage.view.calendar.Calendar.prototype */
  {
    template: template,

    className: 'calendar-view',

    /** Which month to show. 0 indexed number */
    month: undefined,

    /** Which year to show. eg 2014 */
    year: undefined,

    minDateAttr: 'minDate',

    /** min selectable date, inclusive. Set minDate with setMinDate */
    minDate: undefined,

    maxDateAttr: 'maxDate',

    /** max selectable date, inclusive. Set maxDate with setMaxDate */
    maxDate: undefined,

    /** for showing selected range */
    fromAttr: undefined,

    /** for showing selected range */
    toAttr: undefined,

    /** Show week index in a column on the left? */
    showWeekNumbers: false,

    utc: false,

    locale: {
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment()._lang._weekdaysMin.slice(),
      monthNames: moment()._lang._monthsShort.slice(),
      firstDay: 0
    },

    events: {
      'click .prev': 'onPrevClick',
      'click .next': 'onNextClick',
      'click .day': 'onDayClick'
    },

    /**
     * View that renders a selectable calendar.
     *
     * Useful when incoporated in fields like [DateField]{@link Plumage.view.form.fields.DateField}
     * and [DateRangeField]{@link Plumage.view.form.fields.DateRangeField}.
     *
     * Not a [ModelView]{@link Plumage.view.ModelView}, but keeps and updates its own view state
     * ([selectedDate]{@link Plumage.view.calendar.Calendar#selectedDate}, [month]{@link Plumage.view.calendar.Calendar#month},
     * [year]{@link Plumage.view.calendar.Calendar#year},
     *
     * Calendar can also limit selectable dates with [minDate]{@link Plumage.view.calendar.Calendar#minDate} and
     * [maxDate]{@link Plumage.view.calendar.Calendar#maxDate}, and highlight a selected range (useful in a date range picker)
     * with [fromDate]{@link Plumage.view.calendar.Calendar#fromDate} and
     * [toDate]{@link Plumage.view.calendar.Calendar#toDate}.
     *
     * Emitted events: prevclick, nextclick, dayclick
     *
     * @constructs
     * @extends Plumage.view.View
     */
    initialize: function() {
      Field.prototype.initialize.apply(this, arguments);

      this.month = this.month !== undefined ? this.month : moment().month();
      this.year = this.year ? this.year : moment().year();
    },

    getTemplateData: function() {
      var data = _.clone(this.locale);

      var calendar = this.getCalendarDates(this.month, this.year);

      for(var i=0;i<calendar.length;i++) {
        var week = calendar[i];
        for(var j=0;j<week.length;j++) {
          var day = week[j];
          _.extend(day, {
            number: day.date[2],
            cls: this.getClassesForDate(day.date, i, j).join(' ')
          });
        }
      }
      return {
        locale: this.locale,
        month: this.locale.monthNames[this.month],
        year: this.year,
        prevAvailable: this.isPrevMonthAvailable(),
        nextAvailable: this.isNextMonthAvailable(),
        showWeekNumbers: this.showWeekNumbers,
        calendar: calendar
      };
    },

    update: function(isLoad) {
      if (this.isRendered && this.shouldRender(isLoad)) {
        this.render();
      }
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var modelValue = model.get(this.valueAttr);
      if (modelValue) {
        //don't change hour
        var m = this.utc ? moment.utc(modelValue) : moment(modelValue);
        var date = this.getSelectedDate();
        m.year(date[0]);
        m.month(date[1]);
        m.date(date[2]);
        value = m.valueOf();
      }
      model.set(this.valueAttr, value);
    },

    /**
     * Set the month to display (view state), and update.
     */
    setMonth: function(month, year) {
      this.month = month;
      this.year = year;
      this.update();
    },

    setValue: function(value, options) {
      if (!this.isDateInMinMax(this.toDateTuple(value))) {
        return;
      }
      Field.prototype.setValue.apply(this, arguments);
      this.update();
    },

    valueChanged: function() {
      var value = this.getValue();
      if (value) {
        var m = this.utc ? moment.utc(value) : moment(value);
        this.month = m.month();
        this.year = m.year();
      }
    },

    /**
     * Get the minimum selectable date (inclusive)
     */
    getMinDate: function() {
      if (this.minDate) {
        return this.minDate;
      }
      if (this.model && this.minDateAttr) {
        return this.toDateTuple(this.model.get(this.minDateAttr));
      }
      return null;
    },

    setMinDate: function(minDate) {
      this.minDate = this.toDateTuple(minDate);
    },

    setMaxDate: function(maxDate) {
      this.maxDate = this.toDateTuple(maxDate);
    },

    /**
     * Set the maximum selectable date (inclusive)
     */
    getMaxDate: function() {
      if (this.maxDate) {
        return this.maxDate;
      }
      if (this.model && this.maxDateAttr) {
        return this.toDateTuple(this.model.get(this.maxDateAttr));
      }
      return null;
    },

    //
    // Helpers
    //

    toDateTuple: function(date) {
      if (!date) {
        return null;
      }
      date = DateTimeUtil.parseRelativeDate(date);
      if ($.isArray(date)) {
        return date;
      }
      var m = date;
      if ($.isNumeric(m)) {
        m = this.utc ? moment.utc(m) : moment(m);
      } else {
        m = moment(m);
      }
      return [m.year(), m.month(), m.date()];
    },

    getSelectedDate: function() {
      var value = this.getValue();
      if (value) {
        return this.toDateTuple(this.getValue());
      }
      return null;
    },

    getFromDate: function() {
      if (this.model && this.fromAttr) {
        return this.toDateTuple(this.model.get(this.fromAttr));
      }
      return null;
    },

    getToDate: function() {
      if (this.model && this.toAttr) {
        return this.toDateTuple(this.model.get(this.toAttr));
      }
      return null;
    },

    /**
     * Helper: Get 2d array of days
     */
    getCalendarDates: function (month, year) {
      var calendar = [];
      var curDate = this.getFirstDate(month, year);
      for(var i=0;i<6;i++) {
        var week = [];
        for(var j=0;j<7;j++) {
          week.push({
            date: curDate,
          });
          var m = moment(curDate).add('day', 1);
          curDate = [m.year(), m.month(), m.date()];
        }
        calendar.push(week);
      }
      return calendar;
    },

    /**
     * Helper: Get first day on calendar page for month, year
     */
    getFirstDate: function(month, year) {
      var firstDay = moment([year, month, 1]),
        monthAgo = moment(firstDay).subtract('month', 1);

      var daysInLastMonth = monthAgo.daysInMonth(),
        dayOfWeek = firstDay.day(),
        firstDate = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;

      if (firstDate > daysInLastMonth) {
        firstDate -= 7;
      }
      if (dayOfWeek === this.locale.firstDay) {
        firstDate = daysInLastMonth - 6;
      }
      return [monthAgo.year(), monthAgo.month(), firstDate];
    },

    /**
     * Helper: Get CSS classes for a day element.
     */
    getClassesForDate: function(date, row, col) {
      var inMonth = this.isDateTupleInMonth(date);
      var classes = [
        this.isDateInMinMax(date) ? 'active' : 'disabled',
        inMonth ? null : 'off',
        _.isEqual(date, this.getSelectedDate()) ? 'selected' : null,
        inMonth && _.isEqual(date, this.getFromDate()) ? 'start-date' : null,
        inMonth && _.isEqual(date, this.getToDate()) ? 'end-date' : null,
        this.isDateInSelectedRange(date) ? 'in-range' : null,
        this.getShadowClass(date, row, col)
      ];

      return _.compact(classes);
    },

    /**
     * Helper: Get box shadow class for dates off the current month.
     */
    getShadowClass: function(date, row, col) {
      if (!this.isDateTupleInMonth(date)) {
        if (row < 2) {
          var nextWeek = this.toDateTuple(moment(date).add('day', 7)),
            tomorrow = this.toDateTuple(moment(date).add('day', 1));
          if (this.isDateTupleInMonth(nextWeek)) {
            if (col < 6 && this.isDateTupleInMonth(tomorrow)) {
              return 'shadow-bottom-right';
            } else {
              return 'shadow-bottom';
            }
          }
        } else {
          var lastWeek = this.toDateTuple(moment(date).subtract('day', 7)),
            yesterday = this.toDateTuple(moment(date).subtract('day', 1));
          if (this.isDateTupleInMonth(lastWeek)) {
            if (col > 0 && this.isDateTupleInMonth(yesterday)) {
              return 'shadow-top-left';
            } else {
              return 'shadow-top';
            }
          }
        }
      }
      return null;
    },

    isDateTupleInRange: function(date, minDate, maxDate) {
      return (!minDate || moment(date) >= moment(minDate)) && (!maxDate || moment(date) <= moment(maxDate));
    },

    isDateInSelectedRange: function(date) {
      var fromDate = this.getFromDate(),
        toDate = this.getToDate();
      if (!fromDate || !toDate) {
        return false;
      }
      return this.isDateTupleInRange(date, fromDate, toDate);
    },

    isDateInMinMax: function(date) {
      date = this.toDateTuple(date);
      return this.isDateTupleInRange(date, this.getMinDate(), this.getMaxDate());
    },

    isDateTupleInMonth: function(date) {
      return date[1] === this.month;
    },

    isPrevMonthAvailable: function() {
      var m = moment([this.year, this.month, 1]).subtract('day', 1);
      return this.isDateInMinMax(this.toDateTuple(m));
    },

    isNextMonthAvailable: function() {
      var firstDate = moment([this.year, this.month, 1]),
        m = moment([this.year, this.month, firstDate.daysInMonth()]).add('day', 1);
      return this.isDateInMinMax(this.toDateTuple(m));
    },

    getDateFromDayEl: function(el) {
      el = $(el);
      var td = el.parent();
      var dateNumber = Number(el.text());

      if (td.hasClass('off')) {
        var offMonth = moment([this.year, this.month, 1]);
        if (td.data('row') < 3) {
          offMonth = offMonth.subtract('month', 1);
        } else {
          offMonth = offMonth.add('month', 1);
        }
        return this.toDateTuple(offMonth.date(dateNumber));
      }
      return [this.year, this.month, dateNumber];
    },

    //
    // EventHandlers
    //

    onModelChange: function (e) {
      if (e.changed[this.valueAttr] !== undefined || e.changed[this.minDateAttr] !== undefined || e.changed[this.maxDateAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },

    onPrevClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var lastMonth = moment([this.year, this.month, 1]).subtract('month', 1);
      this.setMonth(lastMonth.month(), lastMonth.year());

      this.trigger('prevclick', this);
    },

    onNextClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var nextMonth = moment([this.year, this.month, 1]).add('month', 1);
      this.setMonth(nextMonth.month(), nextMonth.year());

      this.trigger('nextclick', this);
    },

    onDayClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var td = $(e.target).parent();
      if (!td.hasClass('disabled')) {
        var date = this.getDateFromDayEl(e.target),
          m = this.utc ? moment.utc(date) : moment(date);
        this.setValue(m.valueOf());
      }
    }
  });
});