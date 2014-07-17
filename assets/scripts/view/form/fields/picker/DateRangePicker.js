define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/ModelView',
  'view/form/fields/Field',
  'view/form/fields/HourSelect',
  'view/form/fields/Calendar',
  'text!view/form/fields/picker/templates/DateRangePicker.html',
], function($, _, Backbone, Handlebars, moment, Plumage, ModelView, Field, HourSelect, Calendar, template) {

  return  Plumage.view.form.fields.picker.DateRangePicker = ModelView.extend(
  /** @lends Plumage.view.form.fields.picker.DateRangePicker.prototype */
  {
    template: template,

    modelCls: false, //never bind via setModel

    className: 'date-range-picker dropdown-menu form-inline',

    showHourSelect: false,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    /** Which side to open the picker on*/
    opens: 'right',

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
      updateModelOnChange: true
    }, {
      viewCls: Calendar,
      name: 'toCal',
      selector: '.to-calendar',
      valueAttr: 'toDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      minDateAttr: 'fromDate',
      maxDateAttr: 'maxDate',
      updateModelOnChange: true,
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
      updateModelOnChange: true,
      preventFocus: true,
      replaceEl: true
    }, {
      viewCls: HourSelect,
      name: 'toHour',
      selector: '.to-hour',
      valueAttr: 'toDate',
      minDateAttr: 'fromDate',
      maxDateAttr: 'maxDate',
      updateModelOnChange: true,
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

      ModelView.prototype.initialize.apply(this, arguments);

      var formatDate = function(date) {
        var m = this.utc ? moment.utc(date) : moment(date);
        return m.format(this.dateFormat);
      }.bind(this);

      this.getSubView('fromDate').getValueString = formatDate;
      this.getSubView('toDate').getValueString = formatDate;

      this.setModel(new Plumage.model.Model({}, {urlRoot: '/'}), null, true);
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);
      this.$el.addClass('opens' + this.opens);
      this.$el.toggleClass('show-hour-select', this.showHourSelect);
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);

      return _.extend(data, {
        ranges: this.ranges,
        opens: this.opens,
        showHourSelect: this.showHourSelect
      });
    },

    update: function() {
      var fromCal = this.getSubView('fromCal'),
        toCal = this.getSubView('toCal');
      ModelView.prototype.update.apply(this, arguments);
    },

    setShowHourSelect: function(showHourSelect) {
      this.showHourSelect = showHourSelect;
      if(this.isRendered) {
        this.render();
      }
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
      this.model.set({
        fromDate: value[0].valueOf(),
        toDate: value[1].valueOf()
      });
      this.update();
    },

    //
    // Events
    //
    onChange: function(e) {
      //disable automatic updating from Field
    },

    onMouseDown: function(e) {
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