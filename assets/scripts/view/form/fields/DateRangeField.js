define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/picker/DateRangePicker',
  'text!view/form/fields/templates/DateRangeField.html',
], function($, _, Backbone, Handlebars, moment, Plumage, Field, DateRangePicker, template) {

  return  Plumage.view.form.fields.DateRangeField = Field.extend(
  /** @lends Plumage.view.form.fields.DateRangeField.prototype */
  {

    template: template,

    className: 'date-range-picker',

    /** model attribute used as the start of the selected date range. */
    fromAttr: undefined,

    /** model attribute used as the end of the selected date range. */
    toAttr: undefined,

    /** show hour select */
    showHourSelect: false,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    /** Options to pass on to contained [Calendar]{@link Plumage.view.calendar.Calendar} object. */
    calendarOptions: undefined,

    /** Which side to open the picker on*/
    opens: 'right',

    /**
     * Date format for text fields. Other formats can be typed into the main field, as long it can be
     * parsed by moment.js
     */
    format: 'MMM D, YYYY',

    formatWithHour: 'MMM D ha, YYYY',

    utc: false,

    events: {
      'focus input:first': 'onFocus',
      'blur input:first': 'onBlur',
      'click input:first': 'onInputClick',
      'click button:first': 'onButtonClick',
    },

    subViews: [{
      viewCls: DateRangePicker,
      name: 'picker',
      selector: '.picker',
      replaceEl: true
    }],

    /**
     * Field for selecting a date range.
     *
     * DateRangeField uses two model attributes to get and store its selection, unlike a normal
     * field that only uses one. The two attribute names are specified by [fromAttr]{@link Plumage.view.form.fields.DateRangeField#fromAttr}
     * and [toAttr]{@link Plumage.view.form.fields.DateRangeField#toAttr}, for the start
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
      if (this.utc) {
        _.each(this.subViews, function(x){x.utc = true;});
      }

      Field.prototype.initialize.apply(this, arguments);

      var picker = this.getSubView('picker');
      picker.showHourSelect = this.showHourSelect;

      picker.on('apply', this.onPickerApply, this);
      picker.on('close', this.onPickerClose, this);
    },

    getInputSelector: function() {
      // skip the button
      return 'input:first';
    },

    setShowHourSelect: function(showHourSelect) {
      this.showHourSelect = showHourSelect;
      this.getSubView('picker').setShowHourSelect(showHourSelect);
    },

    //
    // Value
    //

    getValueString: function(value) {
      if (value && value.length) {
        var format = this.showHourSelect ? this.formatWithHour : this.format;
        var m0 = this.utc ? moment.utc(value[0]) : moment(value[0]);
        var m1 = this.utc ? moment.utc(value[1]) : moment(value[1]);
        return m0.format(format) + ' - ' + m1.format(format);
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

      return Plumage.util.DateTimeUtil.isDateInRange(fromDate, this.minDate, this.maxDate) &&
        Plumage.util.DateTimeUtil.isDateInRange(toDate, this.minDate, this.maxDate);
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

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var newValues = {};
      newValues[this.fromAttr] = value[0];
      newValues[this.toAttr] = value[1];
      model.set(newValues);
    },

    //update the picker model
    valueChanged: function() {
      var pickerModel = this.getSubView('picker').model;
      var value = this.getValue();
      pickerModel.set({
        minDate: this.minDate,
        maxDate: this.maxDate,
        fromDate: value[0],
        toDate: value[1]
      });
    },

    //
    // Helpers
    //

    /** Helper: select the specified preset (value from [ranges]{@link Plumage.view.form.fields.DateRangePicker#ranges}) */
    selectPresetRange: function(range) {
      var value = [range.from, range.to];
      var today = moment({hour: 12});
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
      return this.$('> .dropdown').hasClass('open');
    },

    /** Toggle dropdown open/closed */
    toggle: function() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      this.update();
      this.$('> .dropdown').addClass('open');
    },

    /** Close the dropdown */
    close: function() {
      this.$('> .dropdown').removeClass('open');
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

    onPickerApply: function(picker, value) {
      var pickerModel = picker.model;
      this.setValue([pickerModel.get('fromDate'), pickerModel.get('toDate')]);
      this.close();
    },

    onPickerClose: function() {
      this.close();
    }
  });
});