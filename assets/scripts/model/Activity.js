/*jshint -W103 */

define(['jquery', 'underscore', 'backbone', 'handlebars', 'PlumageRoot', 'moment', 'model/Model',
        'model/User'],
function($, _, Backbone, Handlebars, Plumage, moment, Model, User) {

  return Plumage.model.Activity = Model.extend({

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
        var modelCls = require('model/' + modelType);
        var model = new modelCls(data);
        var displayName = model.getDisplayName();
        return '<a href="'+model.url()+'" class="name" title="'+displayName+'">'+displayName+'</a>';
      }
      return '';
    },

    getActionText: function(data) {
      var actionTexts;
      var context = this;
      while (!actionTexts && context && context.actionTexts) {
        actionTexts = context.actionTexts[this.get('trackable_type')];
        if (!actionTexts || !actionTexts[this.get('action_type')]) {
          context = context.__proto__;
        }
      }
      if (actionTexts) {
        return Handlebars.compile(actionTexts[this.get('action_type')])(data);
      }
    }
  });
});
