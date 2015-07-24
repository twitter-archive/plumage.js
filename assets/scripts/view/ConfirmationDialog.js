/* globals $, _ */
var Plumage = require('PlumageRoot');
var ModalDialog = require('view/ModalDialog');
var MessageView = require('view/MessageView');

var template = require('view/templates/ConfirmationDialog.html');

module.exports = Plumage.view.ConfirmationDialog = ModalDialog.extend({

  template: template,

  headerTemplate: 'Confirmation Dialog',

  message: undefined,

  messageCls: undefined,

  bodyTemplate: 'Are you sure you want to do this?',

  buttonText: 'Confirm',

  buttonCls: 'btn-success',

  events: {
    'click .confirm': 'onConfirmClick'
  },

  subViews: [{
    viewCls: MessageView,
    name: 'message',
    selector: '.message',
    updateOnMessage: false,
    replaceEl: true,
  }],

  initialize: function(options) {
    options = options || {};
    ModalDialog.prototype.initialize.apply(this, arguments);
    this.bodyTemplate = this.initTemplate(this.bodyTemplate);
  },

  getTemplateData: function() {
    var data = ModalDialog.prototype.getTemplateData.apply(this, arguments);
    return _.extend(data, {
      bodyTemplate: this.bodyTemplate(data),
      buttonText: this.buttonText,
      buttonCls: this.buttonCls,
      message:  this.message,
      messageCls: this.messageCls
    });
  },

  setMessage: function(message, messageCls) {
    this.getSubView('message').setMessage(message, messageCls);
  },

  onConfirmClick: function(e) {
    $(e.target).attr('disabled', '');
    this.trigger('confirm');
  }
});

