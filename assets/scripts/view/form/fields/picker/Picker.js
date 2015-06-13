define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'model/Model',
  'view/ModelView'
], function($, _, Backbone, Plumage, Model, ModelView) {

  return  Plumage.view.form.fields.picker.Picker = ModelView.extend(
  /** @lends Plumage.view.form.fields.picker.Picker.prototype */
  {


    modelCls: false, //never bind via setModel

    className: 'dropdown-menu',

    pickerModelAttr: 'value',

    opens: 'right',

    applyOnChange: false,

    events: {
      'mousedown': 'onMouseDown'
    },

    defaultSubViewOptions: {
      updateModelOnChange: true
    },

    /**
     * @constructs
     * @extends Plumage.view.ModelView
     */
    initialize: function(options) {
      this.defaultSubViewOptions = {
        updateModelOnChange: true,
        valueAttr: options.pickerModelAttr || this.pickerModelAttr
      };
      ModelView.prototype.initialize.apply(this, arguments);
      this.setModel(new Model({}, {urlRoot: '/'}), null, true);
    },

    onModelChange: function() {
      ModelView.prototype.onModelChange.apply(this, arguments);
      if (this.applyOnChange) {
        this.trigger('apply', this, this.model);
      }
    },

    getValue: function() {
      return this.model.get(this.pickerModelAttr);
    },

    setValue: function(value) {
      this.model.set(this.pickerModelAttr, value);
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);
      this.$el.addClass('opens' + this.opens);
    },

    getTemplateData: function() {
      return ModelView.prototype.getTemplateData.apply(this, arguments);
    },

    update: function() {
      ModelView.prototype.update.apply(this, arguments);
    },

    //
    // Events
    //

    onMouseDown: function(e) {
      //do nothing so input doesn't lose focus
      e.preventDefault();
      e.stopPropagation();
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.close();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.close();
        this.update();
      }
    }
  });
});