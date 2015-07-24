

define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/templates/InPlaceTextField.html'
], function($, Backbone, Handlebars, Plumage, Field, template) {
  return Plumage.view.form.fields.InPlaceTextField = Field.extend({
    template: template,

    className: 'inplace-field',

    events: {
      'click .field-value': 'onFieldValueClick'
    },

    update: function() {
      Field.prototype.update.apply(this, arguments);
      if (!this.isEditing()) {
        this.render();
      }
    },

    //
    // helpers
    //

    commit: function() {
      this.updateValueFromDom();
      this.hideField();
      this.update();
    },

    cancel: function() {
      this.hideField();
      this.update();
    },

    isEditing: function() {
      return this.$el.hasClass('editing');
    },

    showField: function() {
      this.$el.addClass('editing');
      this.getInputEl().focus();
    },

    hideField: function() {
      this.$el.removeClass('editing');
    },

    //
    // handlers
    //

    onChange: function(e) {
      //do nothing. commit on hide instead of change.
    },

    onInput: function(e) {
      //do nothing. commit on hide instead of change.
    },

    onFieldValueClick: function() {
      this.showField();
    },

    onBlur: function() {
      this.commit();
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.commit();
      } else if (e.keyCode === 27) { //on escape
        this.cancel();
      }
    }
  });
});
