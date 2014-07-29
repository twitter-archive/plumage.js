define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'util/DateTimeUtil',
  'view/form/fields/Field',
  'view/form/fields/FieldWithPicker',
  'view/form/fields/Calendar',
], function($, _, Backbone, Handlebars, moment, Plumage, DateTimeUtil, Field, FieldWithPicker, Calendar) {

  return Plumage.view.form.fields.DateField = FieldWithPicker.extend(
  /** @lends Plumage.view.form.fields.DateField.prototype */
  {

    fieldTemplate: '<div class="input-prepend"><button class="btn" data-toggle="dropdown" data-target="#"><i class="icon-calendar"></i></button>'+FieldWithPicker.prototype.fieldTemplate+'</div>',

    className: 'date-field',

    /** format string for showing the selected date. See moment.js */
    format: 'MMM D, YYYY',

    events: {
      'focus input': 'onFocus',
      'blur input': 'onBlur',
      'click input': 'onInputClick',
      'click button': 'onButtonClick',
    },

    pickerOptions: {
      applyOnChange: true,
      subViews: [{
        viewCls: Calendar,
        name: 'calendar',
        minDateAttr: 'minDate',
        maxDateAttr: 'maxDate'
      }]
    },

    utc: false,

    keepTime: false,

    minDate: undefined,
    maxDate: undefined,

    minDateAttr: undefined,
    maxDateAttr: undefined,

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

      FieldWithPicker.prototype.initialize.apply(this, arguments);
      var calendar = this.getCalendar();
      calendar.utc = this.utc;

      if (this.minDate) {
        this.setMinDate(this.minDate);
      }
      if (this.maxDate) {
        this.setMaxDate(this.maxDate);
      }
    },

    getCalendar: function() {
      return this.getPicker().getSubView('calendar');
    },

    setMinDate: function(minDate) {
      minDate = DateTimeUtil.parseRelativeDate(minDate);
      this.getPicker().model.set('minDate', minDate);
    },

    setMaxDate: function(maxDate) {
      maxDate = DateTimeUtil.parseRelativeDate(maxDate);
      this.getPicker().model.set('maxDate', maxDate);
    },

    /**
     * Override to turn model timestamp into millis timestamp
     */
    getValueFromModel: function() {
      var result = Field.prototype.getValueFromModel.apply(this, arguments);
      if ($.isNumeric(result)) {
        return result * 1000;
      }
    },

    /**
     * Override to turn model timestamp into millis timestamp
     */
    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();
      if ($.isNumeric(value)) {
        value = value / 1000;
      }
      return model.set(this.valueAttr, value) !== false;
    },

    //
    // Overrides
    //

    onInput: function(e) {
      //do nothing on typing. Wait for blur
    },

    getValueString: function(value) {
      if (value) {
        var m = this.utc ? moment.utc(value) : moment(value);
        return m.format(this.format);
      }
      return '';
    },

    isDomValueValid: function(value) {
      var m = this.utc ? moment.utc(value) : moment(value);
      return !value || m.isValid && m.isValid() && this.getCalendar().isDateInMinMax(value);
    },

    processDomValue: function(value) {
      if (value) {
        var m = moment(value);
        var oldValue = this.getValue();
        if (oldValue && this.keepTime) {
          var oldM = moment(oldValue);
          m.hour(oldM.hour()).minute(oldM.minute()).second(oldM.second()).millisecond(oldM.millisecond());
        }
        return m.valueOf();
      }
      return null;
    },

    processPickerValue: function(value) {
      return this.processDomValue(value);
    },

    onModelChange: function(e) {
      FieldWithPicker.prototype.onModelChange.apply(this, arguments);
      this.updateValueFromModel();
    },


    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.update();
      }
    },

    updateValueFromModel: function() {
      FieldWithPicker.prototype.updateValueFromModel.apply(this, arguments);
      if (this.minDateAttr) {
        this.setMinDate(this.model.get(this.minDateAttr));
      }
      if (this.maxDateAttr) {
        this.setMaxDate(this.model.get(this.maxDateAttr));
      }
    }
  });
});
