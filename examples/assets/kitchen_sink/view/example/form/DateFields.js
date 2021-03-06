var moment = require('moment');
var Plumage = require('plumage');
var Vacation = require('example/model/Vacation');
var template = require('kitchen_sink/view/example/form/templates/DateFields.html');

module.exports = Plumage.view.ModelView.extend({

  template: template,

  modelCls: Vacation,

  defaultSubViewOptions: {
    updateModelOnChange: true
  },

  subViews: [
    {
      viewCls: Plumage.view.form.fields.DateField,
      selector: '.date-field1',
      label: 'From Date',
      valueAttr: 'fromDate',
      maxDateAttr: 'toDate'
    },
    {
      viewCls: Plumage.view.form.fields.DateField,
      selector: '.date-field2',
      label: 'To Date',
      valueAttr: 'toDate',
      minDateAttr: 'fromDate'
    },
    {
      viewCls: Plumage.view.form.fields.HourSelect,
      selector: '.hour-field1',
      label: 'From Hour',
      valueAttr: 'fromDate'
    },
    {
      viewCls: Plumage.view.form.fields.DateField,
      selector: '.date-field3',
      valueAttr: 'fromDate',
      maxDateAttr: 'toDate',
      showHourSelect: true,
      replaceEl: true
    },
    {
      viewCls: Plumage.view.form.fields.DateRangeField,
      selector: '.date-range-field',
      fromAttr: 'fromDate',
      toAttr: 'toDate'
    },
    {
      viewCls: Plumage.view.form.fields.DateRangeField,
      selector: '.date-range-field-hour',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      pickerOptions: {
        showHourSelect: true
      }
    },
    {
      viewCls: Plumage.view.form.fields.DurationField,
      selector: '.duration-field',
      valueAttr: 'duration'
    }
  ],

  initialize: function(options) {
    Plumage.view.form.fields.Field.prototype.initialize.apply(this, arguments);

    var model = new Vacation({fromDate: moment().subtract(7, 'day').valueOf(), toDate: moment().valueOf(), duration: 3600000});
    this.setModel(model);
  }
});