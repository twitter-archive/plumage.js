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

  setProps: function(props) {
    this.props = _.extend({}, this.props, props);
    this.update();
  },

  onRender: function() {
    var props = _.extend({}, this.props, this.getModelProps(this.model));

    this.component = React.createElement(this.componentCls, props);
    ReactDOM.render(this.component, this.el);
  },

  getModelProps: function() {
    if (this.model) {
      return this.model.toViewJSON();
    }
    return {};
  },

  updateModel: function(rootModel, parentModel) {
    var model = this.getModelFromRoot(this.relationship, rootModel, parentModel);
    return true;
  }
});