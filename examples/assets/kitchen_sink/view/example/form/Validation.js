define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'plumage',
  'example/ExampleData',
  'example/model/User',
  'text!kitchen_sink/view/example/form/templates/Validation.html',
  'text!data/countries.json'
], function($, _, Backbone, moment, Plumage, ExampleData, User, template, countries) {

  return Plumage.view.ModelView.extend({

    modelCls: User,

    template: template,

    subViews: [{
      viewCls: Plumage.view.form.fields.DateField,
      selector: '.past-date',
      label: 'Date this week',
      minDate: moment().startOf('week'),
      maxDate: moment().startOf('week').add({day: 6})
    }, {
      viewCls: Plumage.view.form.fields.Field,
      selector: '.validated-field',
      label: 'At least 2 characters',
      validationRules: {
        minLength: 2,
        required: true
      }
    }, {
      viewCls: Plumage.view.form.Form,
      selector: '.server-form',
      name: 'serverForm',
      className: 'form-horizontal',
      template: '<div class="fields"></div><div class="address"></div><input type="submit" value="Submit"/>',
      subViews: [{

      }]
    }],
    initialize: function(options) {
      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
    }
  });
});