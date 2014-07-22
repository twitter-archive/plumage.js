define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/picker/Picker',
  'text!view/form/fields/templates/FieldWithPicker.html',
], function($, _, Backbone, Handlebars, moment, Plumage, Field, Picker, template) {

  return  Plumage.view.form.fields.FieldWithPicker = Field.extend(
  /** @lends Plumage.view.form.fields.FieldWithPicker.prototype */
  {

    template: template,

    /** Options to instantiate the Picker with. You can even pass in subViews, so you don't have to subclass Picker. */
    pickerCls: Picker,

    /** Options to instantiate the Picker with. You can even pass in subViews, so you don't have to subclass Picker. */
    pickerOptions: undefined,

    events: {
      'focus input:first': 'onFocus',
      'blur input:first': 'onBlur',
      'click input:first': 'onInputClick',
      'click button:first': 'onButtonClick',
      'keydown input:first': 'onKeyDown'
    },

    /**
     * Base class for fields that show a picker (eg date picker, color picker etc.) when focused.
     *
     * Pass your Picker subclass as pickerCls, or customize the base Picker class by passing in pickerOptions (or do both).
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize:function(options) {
      this.subViews = [_.extend({
        viewCls: this.pickerCls,
        name: 'picker',
        selector: '.picker',
        replaceEl: true
      }, this.pickerOptions)];

      Field.prototype.initialize.apply(this, arguments);

      var picker = this.getSubView('picker');

      picker.on('apply', this.onPickerApply, this);
      picker.on('close', this.onPickerClose, this);
    },

    getPicker: function() {
      return this.getSubView('picker');
    },

    getInputSelector: function() {
      // skip the button
      return 'input:first';
    },

    //update the picker model
    valueChanged: function() {
      var picker = this.getSubView('picker').setValue(this.getValue());
    },

    //
    // Dropdown
    //

    /** Is the dropdown open? */
    isOpen: function() {
      return this.$('.dropdown').hasClass('open');
    },

    /** Toggle dropdown open/closed */
    toggle: function() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      this.update();
      this.$('.dropdown').addClass('open');
    },

    /** Close the dropdown */
    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    /** hook */
    processPickerValue: function(value) {
      return value;
    },

    //
    // overrides
    //

    updateValueFromModel: function (model) {
      Field.prototype.updateValueFromModel.apply(this, arguments);
    },

    //
    // Events
    //
    onChange: function(e) {
      //disable automatic updating from Field
    },

    onModelChange: function (e) {
      Field.prototype.onModelChange.apply(this, arguments);
    },

    onModelLoad: function (e) {
      this.updateValueFromModel();
    },

    onSubmit: function(e) {
      this.updateValueFromDom();
      Field.prototype.onSubmit.apply(this, arguments);
    },

    onInputClick: function(e) {
      this.open();
    },

    onButtonClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.getInputEl().focus();
    },

    onFocus: function(e) {
      this.open();
    },

    onBlur: function(e) {
      this.close();
      this.updateValueFromDom();
      this.trigger('blur', this);
    },

    onPickerApply: function(picker, model) {
      this.setValue(this.processPickerValue(picker.getValue()));
      this.close();
    },

    onPickerClose: function() {
      this.close();
    }
  });
});