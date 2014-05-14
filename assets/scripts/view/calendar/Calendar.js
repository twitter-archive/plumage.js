define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/View',
  'text!view/calendar/templates/Calendar.html'
], function($, _, Backbone, Handlebars, moment, Plumage, View, template) {

  return Plumage.view.calendar.Calendar = View.extend(
  /** @lends Plumage.view.calendar.Calendar.prototype */
  {
    template: template,

    className: 'calendar-view',

    /** Which month to show. 0 indexed number */
    month: undefined,

    /** Which year to show. eg 2014 */
    year: undefined,

    /** min selectable date, inclusive. Set minDate with setMinDate */
    minDate: false,

    /** max selectable date, inclusive. Set maxDate with setMaxDate */
    maxDate: false,

    /** Currently selected date, as moment */
    selectedDate: undefined,

    /** for showing selected range */
    fromDate: undefined,

    /** for showing selected range */
    toDate: undefined,

    /** Show week index in a column on the left? */
    showWeekNumbers: false,

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
     * Useful when incoporated in fields like [DatePicker]{@link Plumage.view.form.fields.DatePicker}
     * and [DateRangePicker]{@link Plumage.view.form.fields.DateRangePicker}.
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
      View.prototype.initialize.apply(this, arguments);

      this.month = this.month !== undefined ? this.month : moment().month();
      this.year = this.year ? this.year : moment().year();
      this.fromDate = this.fromDate && moment(this.fromDate);
      this.toDate = this.toDate && moment(this.toDate);
    },

    getTemplateData: function() {
      var data = _.clone(this.locale);

      var calendar = this.getCalendarDates(this.month, this.year);

      for(var i=0;i<calendar.length;i++) {
        var week = calendar[i];
        for(var j=0;j<week.length;j++) {
          var day = week[j];
          _.extend(day, {
            number: day.date.date(),
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

    /**
     * Set the month to display (view state), and update.
     * Either pass month and year, or a moment object.
     */
    setMonth: function(month, year) {
      if (!$.isNumeric(month)) {
        year = month.year();
        month = month.month();
      }
      this.month = month;
      this.year = year;
      this.update();
    },

    setSelectedDate: function(selectedDate, options) {
      var oldDate = this.selectedDate;

      if (selectedDate) {
        this.selectedDate = moment(selectedDate);
        this.month = this.selectedDate.month();
        this.year = this.selectedDate.year();
        this.update();

      } else {
        this.selectedDate = null;
        this.update();
      }

      if (selectedDate !== oldDate && !(options && options.silent)) {
        this.trigger('dateselected', this, this.selectedDate);
      }
    },

    /**
     * Set the range of days to highlight as selected.
     */
    setSelectedRange: function(fromDate, toDate) {
      this.fromDate = moment(fromDate);
      this.toDate = moment(toDate);
    },

    /**
     * Set the minimum selectable date (inclusive)
     */
    setMinDate: function(minDate) {
      if (minDate) {
        minDate = moment(minDate);
      }
      this.minDate = minDate;
    },

    /**
     * Set the maximum selectable date (inclusive)
     */
    setMaxDate: function(maxDate) {
      if(maxDate) {
        maxDate = moment(maxDate);
      }
      this.maxDate = moment(maxDate);
    },

    //
    // Helpers
    //

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
            date: moment(curDate),
          });
          curDate = curDate.add('hour', 24);
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
      return new moment([monthAgo.year(), monthAgo.month(), firstDate, 12]);
    },

    /**
     * Helper: Get CSS classes for a day element.
     */
    getClassesForDate: function(date, row, col) {
      var inMonth = this.isDateInMonth(date);
      var classes = [
        this.isDateInMinMax(date) ? 'active' : 'disabled',
        inMonth ? null : 'off',
        this.isSameDay(date, this.selectedDate) ? 'selected' : null,
        inMonth && this.isSameDay(date, this.fromDate) ? 'start-date' : null,
        inMonth && this.isSameDay(date, this.toDate) ? 'end-date' : null,
        this.isDateInSelectedRange(date) ? 'in-range' : null,
        this.getShadowClass(date, row, col)
      ];

      return _.compact(classes);
    },

    /**
     * Helper: Get box shadow class for dates off the current month.
     */
    getShadowClass: function(date, row, col) {
      if (!this.isDateInMonth(date)) {
        if (row < 2) {
          var nextWeek = moment(date).add('day', 7),
            tomorrow = moment(date).add('day', 1);
          if (this.isDateInMonth(nextWeek)) {
            if (col < 6 && this.isDateInMonth(tomorrow)) {
              return 'shadow-bottom-right';
            } else {
              return 'shadow-bottom';
            }
          }
        } else {
          var lastWeek = moment(date).subtract('day', 7),
            yesterday = moment(date).subtract('day', 1);
          if (this.isDateInMonth(lastWeek)) {
            if (col > 0 && this.isDateInMonth(yesterday)) {
              return 'shadow-top-left';
            } else {
              return 'shadow-top';
            }
          }
        }
      }
      return null;
    },

    isSameDay: function(date1, date2) {
      if (!date1 || !date2) {
        return false;
      }
      return date1.format('YYYY-MM-DD') === date2.format('YYYY-MM-DD');
    },

    isDateInSelectedRange: function(date) {
      if (!this.fromDate || !this.toDate) {
        return false;
      }
      return this.isDateInRange(date, this.fromDate, this.toDate);
    },

    isDateInMinMax: function(date) {
      return this.isDateInRange(date, this.minDate, this.maxDate);
    },

    isDateInRange: function(date, minDate, maxDate) {
      return !((minDate && !this.isSameDay(date, minDate) && date.isBefore(minDate)) || (
          maxDate && !this.isSameDay(date, maxDate) && date.isAfter(maxDate)));
    },

    isDateInMonth: function(date) {
      return date.month() === this.month;
    },

    isPrevMonthAvailable: function() {
      return this.isDateInMinMax(moment([this.year, this.month, 1]).subtract('day', 1));
    },

    isNextMonthAvailable: function() {
      var firstDate = moment([this.year, this.month, 1]);
      return this.isDateInMinMax(moment([this.year, this.month, firstDate.daysInMonth()]).add('day', 1));
    },

    getDateFromDayEl: function(el) {
      el = $(el);
      var td = el.parent();
      var dateNumber = Number(el.text());

      if (td.hasClass('off')) {
        var offMonth =  moment([this.year, this.month, 1]);
        if (td.data('row') < 3) {
          offMonth = offMonth.subtract('month', 1);
        } else {
          offMonth = offMonth.add('month', 1);
        }
        return offMonth.date(dateNumber);
      }
      return moment([this.year, this.month, dateNumber]);
    },

    //
    // EventHandlers
    //

    onPrevClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var lastMonth = moment([this.year, this.month, 1]).subtract('month', 1);
      this.setMonth(lastMonth);

      this.trigger('prevclick', this);
    },

    onNextClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var lastMonth = moment([this.year, this.month, 1]).add('month', 1);
      this.setMonth(lastMonth);

      this.trigger('nextclick', this);
    },

    onDayClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var td = $(e.target).parent();
      if (!td.hasClass('disabled')) {
        var date = this.getDateFromDayEl(e.target);
        this.setSelectedDate(date);
        this.trigger('dayclick', this, date);
      }
    }
  });
});