define([
  'jquery',
  'underscore',
  'handlebars',
  'moment',
  'plumage',
  'example/model/Vacation',
  'text!kitchen_sink/view/example/form/templates/DateFields.html'
], function($, _, Handlebars, moment, Plumage, Vacation, template) {

  return Plumage.view.ModelView.extend({

    template: template,

    modelCls: Vacation,

    defaultSubViewOptions: {
      updateModelOnChange: true
    },

    subViews: [
      {
        viewCls: Plumage.view.form.fields.DatePicker,
        selector: '.date-picker1',
        label: 'From Date',
        valueAttr: 'fromDate',
      },
      {
        viewCls: Plumage.view.form.fields.DatePicker,
        selector: '.date-picker2',
        label: 'To Date',
        valueAttr: 'toDate'
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
        showHourSelect: true,
        fromAttr: 'fromDate',
        toAttr: 'toDate'
      }
    ],

    initialize: function(options) {
      Plumage.view.form.fields.Field.prototype.initialize.apply(this, arguments);

      var model = new Vacation({fromDate: moment().subtract('day', 7).valueOf(), toDate: moment().valueOf()});
      this.setModel(model);
    }
  });
});