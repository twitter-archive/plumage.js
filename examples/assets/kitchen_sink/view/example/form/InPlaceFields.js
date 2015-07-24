var Plumage = require('plumage');
var User = require('example/model/User');
var template = require('kitchen_sink/view/example/form/templates/InPlaceFields.html');

module.exports = Plumage.view.ModelView.extend({

  modelCls: User,

  template: template,

  subViews: [{
    viewCls: Plumage.view.ModelView,
    selector: '.form1',
    subViews: [{
      viewCls: Plumage.view.form.fields.InPlaceTextField,
      label: 'Name',
      valueAttr: 'name',
      updateModelOnChange: true
    }, {
      viewCls: Plumage.view.DisplayField,
      label: 'City',
      valueAttr: 'city'
    }]
  }, {
    viewCls: Plumage.view.ModelView,
    selector: '.results1',
    subViews: [{
      viewCls: Plumage.view.DisplayField,
      label: 'Name',
      valueAttr: 'name'
    }, {
      viewCls: Plumage.view.DisplayField,
      label: 'City',
      valueAttr: 'city'
    }]
  }],

  initialize:function(options) {
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);

    var model = new User({name: 'Bob Loblaw', city: 'Los Angeles'});
    model.onLoad();
    this.setModel(model);
  }
});