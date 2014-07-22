define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/Calendar',

  'text!view/form/fields/templates/DatePicker.html',
], function($, _, Backbone, Handlebars, moment, Plumage, Field, Calendar, fieldTemplate) {

  return Plumage.view.form.fields.DatePicker = Field.extend(
  /** @lends Plumage.view.form.fields.DatePicker.prototype */
  {

    fieldTemplate: fieldTemplate,

    className: 'date-picker-field',

    /** format string for showing the selected date. See moment.js */
    format: 'MMM D, YYYY',

    /** Options to pass on to contained [Calendar]{@link Plumage.view.calendar.Calendar} object. */
    calendarOptions: undefined,

    events: {
      'focus input': 'onFocus',
      'blur input': 'onBlur',
      'click input': 'onInputClick',
      'click button': 'onButtonClick',
      'mousedown .dropdown-menu': 'onDropdownMouseDown'
    },

    minDate: undefined,
    maxDate: undefined,

    /**
     * Field with a popover calendar for selecting a date.
     *
     * The value can also be set by editing the text field directly, as long as it can be parsed back into a date.
     *
     * See a live demo in the [Kitchen Sink example]{@link /examples/kitchen_sink/form/FieldsAndForms}.
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize: function(options) {
      Field.prototype.initialize.apply(this, arguments);
      this.subViews = [
        new Calendar(_.extend({name: 'calendar', selector: '.calendar'}, this.calendarOptions))
      ].concat(options.subViews || []);
      var calendar = this.getSubView('calendar');

      calendar.setMinDate(this.minDate);
      calendar.setMaxDate(this.maxDate);

      calendar.on('change', this.onCalendarChange, this);
    },

    getInputSelector: function() {
      // skip the button
      return 'input:first';
    },

    getValueString: function(value) {
      if (value) {
        return moment(value).format(this.format);
      }
      return '';
    },

    isDomValueValid: function(value) {
      value = moment(value);
      return !value || value.isValid && value.isValid() && this.getSubView('calendar').isDateInMinMax(value);
    },

    processDomValue: function(value) {
      if (value) {
        return moment(value).valueOf();
      }
      return null;
    },

    update: function() {
      this.getSubView('calendar').setValue(this.getValue());
      Field.prototype.update.apply(this, arguments);
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
      this.$('.dropdown').toggleClass('open');
    },

    /** Open the dropdown */
    open: function() {
      this.$('.dropdown').addClass('open');
    },

    /** Close the dropdown */
    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    //
    // Event Handlers
    //

    onChange: function(e) {
      //disable automatic updating from Field
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
      } else if(e.keyCode === 27) { //on escape
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

    onCalendarChange: function(calendar, value) {
      this.setValue(value);
      this.close();
    }
  });
});
