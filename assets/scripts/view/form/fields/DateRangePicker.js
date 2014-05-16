define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/calendar/Calendar',
  'text!view/form/fields/templates/DateRangePicker.html',
], function($, _, Backbone, Handlebars, moment, Plumage, Field, Calendar, template) {

  return  Plumage.view.form.fields.DateRangePicker = Field.extend(
  /** @lends Plumage.view.form.fields.DateRangePicker.prototype */
  {

    template: Handlebars.compile(template),

    className: 'date-range-picker',

    /** model attribute used as the start of the selected date range. */
    fromAttr: undefined,

    /** model attribute used as the end of the selected date range. */
    toAttr: undefined,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    /** from Date view state before applying  */
    fromDate: undefined,

    /** to Date view state before applying  */
    toDate: undefined,

    /** Options to pass on to contained [Calendar]{@link Plumage.view.calendar.Calendar} object. */
    calendarOptions: undefined,

    /** Which side to open the picker on*/
    opens: 'right',

    /**
     * Date format for text fields. Other formats can be typed into the main field, as long it can be
     * parsed by moment.js
     */
    format: 'MMM D, YYYY',

    /**
     * Preset ranges. Shown as buttons on the side.
     * Array of json objects with attributes:
     *  - name: Text of the button
     *  - from: moment date object for the start of the range.
     *  - to: moment date object for the end of the range.
     *
     *  from and to can also be 'today' or 'yesterday'
     */
    ranges: [
      {name: 'Today', from:'today', to:'today'},
      {name: 'Yesterday', from:'yesterday', to:'yesterday'},
      {name: 'Last 7 Days', from:moment().hour(12).startOf('hour').subtract('day', 6), to:'today'},
      {name: 'Last 30 Days', from:moment().hour(12).startOf('hour').subtract('day', 29), to:'today'},
      {name: 'Last 90 Days', from:moment().hour(12).startOf('hour').subtract('day', 89), to:'today'}
    ],

    events: {
      'focus input:first': 'onFocus',
      'blur input:first': 'onBlur',
      'click input:first': 'onInputClick',
      'click button:first': 'onButtonClick',
      'click .ranges a': 'onRangeClick',
      'click .apply': 'onApplyClick',
      'click .cancel': 'onCancelClick',
      'mousedown .dropdown-menu': 'onDropdownMouseDown'
    },

    /**
     * Field for selecting a date range.
     *
     * DateRangePicker uses two model attributes to get and store its selection, unlike a normal
     * field that only uses one. The two attribute names are specified by [fromAttr]{@link Plumage.view.form.fields.DateRangePicker#fromAttr}
     * and [toAttr]{@link Plumage.view.form.fields.DateRangePicker#toAttr}, for the start
     * and end of the range respectively.
     *
     * The user can either select from and to dates from the left and right calendars respectively, or they
     * can choose from a list of presets. In either 'apply' must be clicked before the field's value is set.
     *
     * The value can also be set by editing the text field directly, as long as it can be parsed back into dates.
     *
     * See a live demo in the [Kitchen Sink example]{@link /examples/kitchen_sink/form/FieldsAndForms}
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize:function(options) {
      options = options || {};
      Field.prototype.initialize.apply(this, arguments);
      this.subViews = [
        this.fromCalendar = new Calendar(_.extend({selector: '.from-calendar'}, this.calendarOptions)),
        this.toCalendar = new Calendar(_.extend({selector: '.to-calendar'}, this.calendarOptions))
      ].concat(options.subViews || []);
      this.fromCalendar.on('dayclick', this.onDayClick.bind(this));
      this.toCalendar.on('dayclick  ', this.onDayClick.bind(this));

      Field.prototype.initialize.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);
      return _.extend(data, {
        ranges: this.ranges,
        fromDate: moment(this.fromDate).format(this.format),
        toDate: moment(this.toDate).format(this.format),
        opens: this.opens
      });
    },

    update: function() {
      this.fromCalendar.setMinDate(this.minDate);
      this.fromCalendar.setMaxDate(this.toDate);
      this.fromCalendar.setSelectedRange(this.fromDate, this.toDate);
      this.fromCalendar.setSelectedDate(this.fromDate);

      this.$('input[name=daterangepicker_from]').val(moment(this.fromDate).format(this.format));

      this.toCalendar.setMinDate(this.fromDate);
      this.toCalendar.setMaxDate(this.maxDate);
      this.toCalendar.setSelectedRange(this.fromDate, this.toDate);
      this.toCalendar.setSelectedDate(this.toDate);
      this.$('input[name=daterangepicker_to]').val(moment(this.toDate).format(this.format));

      Field.prototype.update.apply(this, arguments);

    },

    getInputSelector: function() {
      // skip the button
      return 'input:first';
    },

    //
    // Value
    //

    getValueString: function() {
      var value = this.getValue();
      if (value && value.length) {
        return moment(value[0]).format(this.format) + ' - ' + moment(value[1]).format(this.format);
      }
      return '';
    },

    //
    // View value <--> DOM
    //

    isDomValueValid: function(value) {
      if (!value) {
        return true;
      }
      var values = value.split('-');
      if (values.length !== 2) {
        return false;
      }
      var fromDate = moment(values[0].trim()),
        toDate = moment(values[1].trim());

      if (!fromDate.isValid() || !toDate.isValid()) {
        return false;
      }

      if (fromDate > toDate) {
        return false;
      }

      return this.fromCalendar.isDateInMinMax(fromDate) && this.fromCalendar.isDateInMinMax(fromDate);
    },

    processDomValue: function(value) {
      if (!value) {
        return null;
      }
      var values = value.split('-'),
        fromDate = moment(values[0].trim()).valueOf(),
        toDate = moment(values[1].trim()).valueOf();
      return [fromDate, toDate];
    },

    updateSelection: function() {
      var value = this.getValue();
      if (value) {
        this.fromDate = value[0];
        this.toDate = value[1];
      } else {
        this.fromDate = undefined;
        this.toDate = undefined;
      }
    },

    //
    // View value <--> Model
    //

    getValueFromModel: function() {
      if (this.model) {
        var from = this.model.get(this.fromAttr),
          to = this.model.get(this.toAttr);
        if (!from || !to) {
          return null;
        }
        return [from, to];
      }
    },

    updateModel: function(rootModel) {
      var model = this.getModelFromRoot(rootModel, this.relationship),
        value = this.getValue();

      var newValues = {};
      if (value) {
        newValues[this.fromAttr] = value[0];
        newValues[this.toAttr] = value[1];
        model.set(newValues);
      } else {
        newValues[this.fromAttr] = null;
        newValues[this.toAttr] = null;
        model.set(newValues);
      }
    },

    // Keep view state up to date
    valueChanged: function() {
      this.updateSelection();
    },

    //
    // Helpers
    //

    /** Helper: select the specified preset (value from [ranges]{@link Plumage.view.form.fields.DateRangePicker#ranges}) */
    selectPresetRange: function(range) {
      var value = [range.from, range.to];
      var today = moment().hour(12).startOf('hour');
      for (var i=0; i<value.length; i++) {
        if (value[i] === 'today') {
          value[i] = today;
        } else if (value[i] === 'yesterday') {
          value[i] = moment(today).subtract('day', 1);
        }
      }
      this.fromDate = value[0].valueOf();
      this.toDate = value[1].valueOf();
      this.update();
    },

    /** Helper: Update the field value with the current selection. */
    applySelection: function() {
      if (this.fromDate && this.toDate) {
        this.setValue([this.fromDate, this.toDate]);
      } else {
        this.setValue(null);
      }
    },

    //
    // Dropdown
    //

    /** Is the dropdown open? */
    isOpen: function() {
      return this.$('.dropdown').hasClass('open');
    },

    /** Toggle dropdown open/closed */
    toggle: function() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },

    /** Open the dropdown */
    open: function() {
      this.update();
      this.$('.dropdown').addClass('open');
    },

    /** Close the dropdown */
    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    //
    // Events
    //
    onChange: function(e) {
      //disable automatic updating from Field
    },

    onModelChange: function (e) {
      if (e.changed[this.fromAttr] !== undefined || e.changed[this.toAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },

    onModelLoad: function (e) {
      this.updateValueFromModel();
    },

    onDropdownMouseDown: function(e) {
      //do nothing so input doesn't lose focus
      e.preventDefault();
      e.stopPropagation();
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.close();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.close();
        this.update();
      }
    },

    onSubmit: function(e) {
      this.updateValueFromDom();
      Field.prototype.onSubmit.apply(this, arguments);
    },

    onInputClick: function(e) {
      this.open();
    },

    onFocus: function(e) {
      this.open();
    },

    onBlur: function(e) {
      this.close();
      this.updateValueFromDom();
    },

    onButtonClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.getInputEl().focus();
    },

    onDayClick: function(calendar, date) {
      if (date.valueOf) {
        date = date.valueOf();
      }
      if (calendar === this.fromCalendar) {
        this.fromDate = date;
      } else {
        this.toDate = date;
      }
      this.update();
    },

    onRangeClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var range = _.findWhere(this.ranges, {name: e.target.text});
      this.selectPresetRange(range);
    },

    onApplyClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.applySelection();
      this.getInputEl().blur();
    },

    onCancelClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    },
  });
});