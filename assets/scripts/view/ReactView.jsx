import $ from 'jquery';

import Plumage from 'PlumageRoot';
import ModelView from './ModelView';
import React from 'react';
import ReactDOM from 'react-dom';

import ModelProvider from 'components/ModelProvider';

module.exports = Plumage.view.ReactView = ModelView.extend({

  className: 'react-view',

  component: undefined,
  componentCls: undefined,
  props: undefined,

  events: {
    'click a': 'onLinkClick'
  },

  initialize: function() {
    ModelView.prototype.initialize.apply(this, arguments);
  },

  setProps: function(props) {
    this.props = Object.assign({}, this.props, props);
    this.update();
  },

  onLinkClick: function(e) {
    var href = $(e.target).closest('a')[0].href;
    if (href) {
      ModelView.prototype.onLinkClick.apply(this, arguments);
    }
  },

  onRender: function() {
    this.component = this.createReactElement();
    ReactDOM.render(this.component, this.el);
  },

  createReactElement: function() {
    const props = Object.assign({}, this.props, this.getModelProps(this.model));
    return React.createElement(this.componentCls, props);
  },

  getModelProps: function(model) {
    if (model) {
      const result = model.toViewJSON();
      result.loading = !model.fetched;
      return Object.assign({model}, result);
    }
    return {};
  }
});