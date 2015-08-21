var _ = require('underscore');
var Plumage = require('PlumageRoot');
var ModelView = require('./ModelView');
var React = require('react');
var ReactDOM = require('react-dom');

module.exports = Plumage.view.ReactView = ModelView.extend({

  componentCls: undefined,
  props: undefined,

  initialize: function() {
    ModelView.prototype.initialize.apply(this, arguments);
  },

  onRender: function() {
    var props = _.extend({}, this.props);
    if (this.model) {
      props.model = this.getModelProps(this.model);
    }

    this.component = React.createElement(this.componentCls, props);
    ReactDOM.render(this.component, this.el);
  },

  getModelProps: function() {
    return this.model.toViewJSON();
  },

  updateModel: function(rootModel, parentModel) {
    var model = this.getModelFromRoot(this.relationship, rootModel, parentModel);
    return true;
  }
});