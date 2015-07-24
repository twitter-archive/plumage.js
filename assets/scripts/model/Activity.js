/* globals $, _ */
var Backbone = require('backbone');
var Handlebars = require('handlebars');
var Plumage = require('PlumageRoot');
var moment = require('moment');
var Model = require('model/Model');
var User = require('model/User');

module.exports = Plumage.model.Activity = Model.extend({

  urlRoot: '/activities',

  actionTexts: {
    'Description': {
      'create': 'added a description to {{{recipientHTML}}}',
      'update': 'updated the description of {{{recipientHTML}}}'
    },
    'Comment': {
      'create': 'commented on {{{recipientHTML}}}'
    }
  },

  relationships: {
    'user': {
      modelCls: User,
      forceCreate: false
    }
  },

  toViewJSON: function() {
    var data = Model.prototype.toViewJSON.apply(this, arguments);
    data.recipientHTML = this.getRelatedModelHTML(this.get('recipient_type'), this.get('recipient'));
    data.trackableHTML = this.getRelatedModelHTML(this.get('trackable_type'), this.get('trackable'));
    data.action_text = this.getActionText(data);
    data.create_at_text = moment(Number(data.created_at)*1000).fromNow();
    return data;
  },

  getRelatedModelHTML: function(modelType, data) {
    if (modelType) {
      return '<a href="'+data.href+'" class="name" title="'+ data.label+'">'+data.label+'</a>';
    }
    return '';
  },

  getActionText: function(data) {
    var actionTexts;
    var context = this;
    while (!actionTexts && context && context.actionTexts) {
      actionTexts = context.actionTexts[this.get('trackable_type')];
      if (!actionTexts || !actionTexts[this.get('action_type')]) {
        context = Object.getPrototypeOf(context);
      }
    }
    if (actionTexts) {
      return Handlebars.compile(actionTexts[this.get('action_type')])(data);
    }
  }
});
