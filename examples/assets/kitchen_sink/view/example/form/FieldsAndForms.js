define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'plumage',
  'example/ExampleData',
  'example/model/User',
  'kitchen_sink/view/example/form/templates/FieldsAndForms.html',
  'data/countries.json'
], function($, _, Backbone, Handlebars, Plumage, ExampleData, User, template, countries) {

  var Form1 = Plumage.view.form.Form.extend();

  var Results1 = Plumage.view.ModelView.extend();

  return Plumage.view.ModelView.extend({

    modelCls: User,

    template: template,

    fields: ['name', 'address1', 'address2', 'country'],

    subViews: [
      {
        name: 'updateOnChange',
        viewCls: Plumage.view.form.fields.Checkbox,
        selector: '#update-on-change',
        label: ' ',
        checkboxLabel: 'Update Model on Change'
      }, {
        name: 'form1',
        selector: '.form1',
        viewCls: Plumage.view.form.Form,

        className: 'form-horizontal',
        template: '<div class="fields"></div><div class="address"></div><input type="submit" value="Submit"/>',
        subViews: [
          {viewCls: Plumage.view.form.fields.Checkbox, selector: '.fields', label: 'Billing?', valueAttr: 'billing'},
          {viewCls: Plumage.view.form.fields.Field, selector: '.fields', label: 'Name', valueAttr: 'name'},
          {
            viewCls: Plumage.view.ModelView,
            name: 'addressFields',
            selector: '.address',
            className: 'well',
            subViews: [
              {viewCls: Plumage.view.form.fields.Field, label: 'Address 1', valueAttr: 'address1'},
              {viewCls: Plumage.view.form.fields.Field, label: 'City', valueAttr: 'city'},
              {
                name: 'countrySelect',
                viewCls: Plumage.view.form.fields.Select,
                label: 'Country',
                valueAttr: 'country',
                listValueAttr: 'name',
                listLabelAttr: 'name'
              }
            ]
          }
        ],
      }, {
        viewCls: Plumage.view.ModelView,
        selector: '.results1',
        className: 'form-horizontal',
        defaultSubViewCls: Plumage.view.DisplayField,

        subViews: [
          {label: 'Billing?', valueAttr: 'billing'},
          {label: 'Name', valueAttr: 'name'},
          {label: 'Address 1', valueAttr: 'address1'},
          {label: 'City', valueAttr: 'city'},
          {label: 'Country', valueAttr: 'country'}
        ]
      }
    ],

    initialize:function(options) {
      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);

      this.getSubView('updateOnChange').on('change', this.onUpdateOnChangeClick.bind(this));

      var countryData = new Plumage.collection.DataCollection(countries);
      this.getSubView('form1.addressFields.countrySelect').setListModel(countryData);

      var model = new User();
      model.onLoad();
      this.setModel(model);
    },

    onUpdateOnChangeClick: function(checkbox) {
      var value = Boolean(checkbox.getValue());
      this.getSubView('form1').updateModelOnChange = value;
    }
  });
});