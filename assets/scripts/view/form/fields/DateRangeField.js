define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/FieldWithPicker',
  'view/form/fields/picker/DateRangePicker',
], function($, _, Backbone, Handlebars, moment, Plumage, FieldWithPicker, DateRangePicker) {

  return  Plumage.view.form.fields.DateRangeField = FieldWithPicker.extend(
  /** @lends Plumage.view.form.fields.DateRangeField.prototype */
  {

    fieldTemplate: '<div class="input-prepend"><button class="btn" data-toggle="dropdown" data-target="#"><i class="icon-calendar"></i></button>'+FieldWithPicker.prototype.fieldTemplate+'</div>',

    className: 'date-range-field',

    /** model attribute used as the start of the selected date range. */
    fromAttr: undefined,

    /** model attribute used as the end of the selected date range. */
    toAttr: undefined,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    pickerCls: DateRangePicker,

    /** Options to pass on to contained [DateRangePicker]{@link Plumage.view.form.fields.picker.DateRangePicker} object. */
    pickerOptions: undefined,

    /** Which side to open the picker on*/
    opens: 'right',

    /**
     * Date format for text fields. Other formats can be typed into the main field, as long it can be
     * parsed by moment.js
     */
    format: 'MMM D, YYYY',

    formatWithHour: 'MMM D ha, YYYY',

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
      FieldWithPicker.prototype.initialize.apply(this, arguments);
    },

    setShowHourSelect: function(showHourSelect) {
      this.getPicker().setShowHourSelect(showHourSelect);
    },

    setMaxDate: function(maxDate) {
      this.getPicker().model.set('maxDate', maxDate);
    },

    setMinDate: function(minDate) {
      this.getPicker().model.set('minDate', minDate);
    },

    //
    // Value
    //

    processValueForDom: function(value) {
      if (value && value.length) {
        var picker = this.getPicker();
        var format = picker.showHourSelect ? this.formatWithHour : this.format;
        var m0 = picker.utc ? moment.utc(value[0]) : moment(value[0]);
        var m1 = picker.utc ? moment.utc(value[1]) : moment(value[1]);
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
      var utc = this.getPicker().utc,
        fromDate = utc ? moment.utc(values[0].trim()) : moment(values[0].trim()),
        toDate = utc ? moment.utc(values[1].trim()) : moment(values[1].trim());

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
      var format = this.getPicker().showHourSelect ? this.formatWithHour : this.format;
      var values = value.split('-'),
        utc = this.getPicker().utc,
        m0 = utc ? moment.utc(values[0].trim(), format) : moment(values[0].trim()),
        m1 = utc ? moment.utc(values[1].trim(), format) : moment(values[1].trim()),
        fromDate = m0.valueOf(),
        toDate = m1.valueOf();
      return [fromDate, toDate];
    },

    //
    // View value <--> Model
    //

    getValueFromModel: function() {
      if (this.model) {
        var from = this.model.get(this.fromAttr),
          to = this.model.get(this.toAttr);
        return [from, to];
      }
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var newValues = {};
      newValues[this.fromAttr] = value[0];
      newValues[this.toAttr] = value[1];
      return model.set(newValues);
    },

    valueChanged: function() {
      FieldWithPicker.prototype.valueChanged.apply(this, arguments);
      this.getPicker().model.set({
        minDate: this.minDate,
        maxDate: this.maxDate
      });
    },

    //
    // Events
    //

    onModelChange: function (e) {
      if (e.changed[this.fromAttr] !== undefined || e.changed[this.toAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.update();
      }
    },
  });
});