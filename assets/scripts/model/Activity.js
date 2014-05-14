define(['jquery', 'underscore', 'backbone', 'PlumageRoot', 'moment', 'model/Model',
        'model/User'],
function($, _, Backbone, Plumage, moment, Model) {

  return Plumage.model.Activity = Model.extend({

    urlRoot: '/activities',

    actionTexts: {
      'Description': {
        'create': 'added a description to',
        'update': 'updated the description of'
      },
      'Comment': {
        'create': 'commented on'
      }
    },

    relationships: {
      'user': {
        modelCls: 'model/User',
        forceCreate: false
      }
    },

    toViewJSON: function() {
      var model = this.getModel();
      var data = Model.prototype.toViewJSON.apply(this, arguments);
      data.model_url = model.url();
      data.model_label = model.getLabel();
      data.action_text = this.getActionText();
      data.create_at_text = moment(Number(data.created_at)*1000).fromNow();
      return data;
    },

    getModel: function() {
      var recipientCls = require('model/' + this.get('recipient_type'));
      return new recipientCls(this.get('recipient'));
    },

    getActionText: function() {
      var actionTexts = this.actionTexts[this.get('trackable_type')];
      if (actionTexts && actionTexts[this.get('action_type')]) {
        return actionTexts[this.get('action_type')];
      }
    }
  });
});