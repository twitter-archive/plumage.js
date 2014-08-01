define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/picker/Picker',
  'view/form/fields/Field',
  'view/form/fields/HourSelect',
  'view/form/fields/Calendar',
  'text!view/form/fields/picker/templates/DateRangePicker.html',
], function($, _, Backbone, Handlebars, moment, Plumage, Picker, Field, HourSelect, Calendar, template) {

  return  Plumage.view.form.fields.picker.DateRangePicker = Picker.extend(
  /** @lends Plumage.view.form.fields.picker.DateRangePicker.prototype */
  {
    template: template,

    className: 'date-range-picker dropdown-menu form-inline',

    showHourSelect: false,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    /**
     * Date format for text fields. Other formats can be typed into the main field, as long it can be
     * parsed by moment.js
     */
    dateFormat: 'MMM D, YYYY',

    utc: false,

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
      {name: 'Yesterday', from:{day: -1}, to:{day: -1}},
      {name: 'Last 7 Days', from:{day: -6}, to:'today'},
      {name: 'Last 30 Days', from:{day: -29}, to:'today'},
      {name: 'Last 90 Days', from:{day: -89}, to:'today'}
    ],

    events: {
      'click .ranges a': 'onRangeClick',
      'click .apply': 'onApplyClick',
      'click .cancel': 'onCancelClick',
      'mousedown': 'onMouseDown'
    },

    subViews: [{
      viewCls: Calendar,
      name: 'fromCal',
      selector: '.from-calendar',
      valueAttr: 'fromDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      minDateAttr: 'minDate',
      maxDateAttr: 'toDate',
    }, {
      viewCls: Calendar,
      name: 'toCal',
      selector: '.to-calendar',
      valueAttr: 'toDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      minDateAttr: 'fromDate',
      maxDateAttr: 'maxDate',
    }, {
      viewCls: Field,
      selector: '.from-date',
      name: 'fromDate',
      valueAttr: 'fromDate',
      readonly: true,
      replaceEl: true
    }, {
      viewCls: Field,
      selector: '.to-date',
      name: 'toDate',
      valueAttr: 'toDate',
      readonly: true,
      replaceEl: true
    }, {
      viewCls: HourSelect,
      name: 'fromHour',
      selector: '.from-hour',
      valueAttr: 'fromDate',
      minDateAttr: 'minDate',
      maxDateAttr: 'toDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      preventFocus: true,
      replaceEl: true
    }, {
      viewCls: HourSelect,
      name: 'toHour',
      selector: '.to-hour',
      valueAttr: 'toDate',
      minDateAttr: 'fromDate',
      maxDateAttr: 'maxDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      preventFocus: true,
      replaceEl: true
    }],

    /**
     * @constructs
     * @extends Plumage.view.ModelView
     */
    initialize: function(options) {
      if (this.utc) {
        this.subViews = _.map(this.subViews, _.clone);
        _.each(this.subViews, function(x){x.utc = true;});
      }

      Picker.prototype.initialize.apply(this, arguments);

      var formatDate = function(date) {
        var m = this.utc ? moment.utc(date) : moment(date);
        return m.format(this.dateFormat);
      }.bind(this);

      this.getSubView('fromDate').getValueString = formatDate;
      this.getSubView('toDate').getValueString = formatDate;
    },

    onRender: function() {
      Picker.prototype.onRender.apply(this, arguments);
      this.$el.toggleClass('show-hour-select', this.showHourSelect);
    },

    getTemplateData: function() {
      var data = Picker.prototype.getTemplateData.apply(this, arguments);

      return _.extend(data, {
        ranges: this.ranges,
        opens: this.opens,
        showHourSelect: this.showHourSelect
      });
    },

    setShowHourSelect: function(showHourSelect) {
      this.showHourSelect = showHourSelect;
      if(this.isRendered) {
        this.render();
      }
    },

    //
    // override Picker
    //

    getValue: function() {
      return [this.model.get('fromDate'), this.model.get('toDate')];
    },

    setValue: function(value) {
      var data = {fromDate: undefined, toDate: undefined};
      if (value && value.length) {
        data = {fromDate: value[0], toDate: value[1]};
      }
      this.model.set(data);
    },

    //
    // Helpers
    //

    /** Helper: select the specified preset (value from [ranges]{@link Plumage.view.form.fields.DateRangePicker#ranges}) */
    selectPresetRange: function(range) {
      var value = [range.from, range.to];
      var today = this.utc ? moment.utc({hour: 0}) : moment({hour: 0});
      for (var i=0; i<value.length; i++) {
        if (value[i] === 'today') {
          value[i] = today;
        } else {
          value[i] = today.clone().add(value[i]);
        }
      }
      this.setValue([value[0].startOf('day').valueOf(), value[1].endOf('day').valueOf()]);
      this.update();
    },

    //
    // Events
    //

    onRangeClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var range = _.findWhere(this.ranges, {name: e.target.text});
      this.selectPresetRange(range);
    },

    onApplyClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('apply', this, this.model);
    },

    onCancelClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('close');
    },
  });
});