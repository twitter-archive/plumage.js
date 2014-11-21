define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/form/fields/Field',
  'text!view/form/fields/templates/Select.html'
], function($, _, Backbone, Handlebars, Plumage, ModelView, Field, template) {


  return Plumage.view.form.fields.Select = Field.extend(
  /** @lends Plumage.view.form.fields.Select.prototype */
  {
    /**
     * List of {label:"", value:""} objects to use as select choices.
     * Use either this, listModel or listRelationship
     */
    listValues: undefined,

    /**
     * Model to get select choices from. Which attributes are used label and value are determined by
     * listLabelAttr and listValueAttr.
     * Use either this, or listValues, or listRelationship
     */
    listModel: undefined,

    /**
     * Relationship of this.model to use as listModel.
     * Use either this, or listValues, or listRelationship
     */
    listRelationship: undefined,

    /**
     * Attribute from listModel items to use as the selection value
     */
    listValueAttr: undefined,

    /**
     * Attribute from listModel items to render as the item label
     */
    listLabelAttr: undefined,

    noSelectionText: undefined,
    noSelectionValue: '',
    noItemsText: 'No Items',

    fieldTemplate: template,

    defaultToFirst: false,

    /**
     * Field with extra listModel for possible selections.
     *
     * This class is the base class for all fields that allow choosing from a list.
     *  eg. checkbox, radio, select, combobox, tabs etc
     *
     * By default renders <select> but there are a large number of possible representations.
     *
     * The regular model (representing the selection) is normally, populated by the model hierarchy.
     * The list model needs to be populated manually.
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize: function() {
      Field.prototype.initialize.apply(this, arguments);
      if (this.listValues && this.defaultToFirst) {
        this.setValue(this.listValues[0].value);
      }
    },

    /**
     * Rendering
     **************/

    onRender: function() {
      Field.prototype.onRender.apply(this, arguments);
    },

    update: function(isLoad) {
      ModelView.prototype.update.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);
      _.extend(data, {
        valueLabel: this.getValueLabel(data.value),
        noSelectionValue: this.noSelectionValue,
        noSelectionText: this.noSelectionText,
        noItemsText: this.noItemsText,
        hasSelection: this.hasSelection(),
        defaultToFirst: this.defaultToFirst,
        listValues: this.getListValues(this.model)
      });

      return data;
    },

    getListValues: function(model) {
      if (this.listModel) {
        return this.listModel.map(function(model){
          return this.getItemData(model);
        }, this);
      } else {
        return this.listValues;
      }
    },

    getValueLabel: function(value) {
      var i,
        listValues = this.getListValues(this.model);
      for (i=0;i<listValues.length;i++) {
        if (listValues[i].value === value) {
          return listValues[i].label;
        }
      }
    },

    getValueFromModel: function() {
      var value = Plumage.view.form.fields.Field.prototype.getValueFromModel.apply(this, arguments);
      if (!value && this.defaultToFirst) {
        var values = this.getListValues(this.model);
        if (values && values.length > 0) {
          return values[0];
        }
      }
      return value;
    },

    setValue: function(value) {
      Field.prototype.setValue.apply(this, arguments);
    },

    /**
     * Rendering Helpers/Hooks
     * - override these as needed
     */

    getItemData: function(item) {
      var data = {
        value: this.getListItemValue(item),
        label: this.getListItemLabel(item)
      };
      data.selected = this.isValueSelected(data.value);
      return data;
    },

    isValueSelected: function(value) {
      return value === this.getValue();
    },


    getListItemValue: function(item) {
      return item.get(this.listValueAttr);
    },

    getListItemLabel: function(item) {
      return item.get(this.listLabelAttr);
    },

    hasSelection: function() {
      var value = this.getValue();
      return value !== null && value !== undefined && value !== this.noSelectionValue;
    },

    /**
     * List Model
     **************/

    setModel: function(rootModel, parentModel) {
      Field.prototype.setModel.apply(this, arguments);
      if (this.listRelationship) {
        var listModel = this.getModelFromRoot(this.listRelationship, rootModel, parentModel);
        if (listModel) {
          this.setListModel(listModel);
        }
      }
    },

    setListModel: function(listModel) {
      if (this.listModel) {
        this.listModel.off(null,null,this);
      }
      this.listModel = listModel;
      if (this.listModel) {
        this.listModel.on('change', this.onListModelChange, this);
        this.listModel.on('load', this.onListModelLoad, this);
        this.listModel.on('destroy', this.onListModelDestroy, this);
        this.listModel.on('error', this.onListModelError, this);
      }

      if (this.listModel.size()) {
        this.onListModelLoad(this.listModel);
      }
    },

    getListItemForValue: function(value) {
      var items = this.listModel.select(function(item){return this.getListItemValue(item) === value;}.bind(this));
      return items && items[0];
    },

    /**
     * Event Handlers
     *****************/

    onListModelChange: function(model, options) {
      this.update();
    },

    onListModelLoad: function(model, options) {
      if (this.getValue() === '' && this.defaultToFirst && this.listModel.size() > 0) {
        this.setValue(this.getListItemValue(this.listModel.at(0)));
      } else {
        this.update();
      }
    },

    onListModelDestroy: function(model, options) {
    },

    onListModelError: function(model, response, options) {
      this.onModelError(model, response, options);
    }
  });
});