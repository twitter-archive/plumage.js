/* globals $, _ */
var Backbone = require('backbone');
var Handlebars = require('handlebars');
var Plumage = require('PlumageRoot');
var View = require('view/View');
var ModelView = require('view/ModelView');

var template = require('view/form/fields/templates/Field.html');

module.exports = Plumage.view.form.fields.Field = ModelView.extend(
/** @lends Plumage.view.form.fields.Field.prototype */
{
  className: 'form-group',

  template: template,

  fieldType: 'text',

  /**
   * Template for html input element.
   * This template is separate so that it can be reused by subclasses.
   */
  fieldTemplate: '<input type="{{fieldType}}" name="{{valueAttr}}" class="form-control" {{#placeholder}}placeholder="{{.}}"{{/placeholder}} value="{{value}}" {{#readonly}}readonly="readonly"{{/readonly}} {{#disabled}}disabled=1{{/disabled}}/>',

  /**
   * optional. model attribute to display as label
   */
  labelAttr: undefined,

  /**
   * Value to display as label if no labelAttr
   */
  label: undefined,

  /**
   * model attribute to display and edit
   */
  valueAttr: undefined,

  /**
   * If updateModelOnChange is set, the model is updated on every change
   */
  updateModelOnChange: false,

  /**
   * The view value. It's separate from the model value, and used for rerendering.
   *
   * Because it comes from the dom, value is always a string.
   */
  value: '',

  /** Text to show when blank */
  placeholder: undefined,

  /** required, minLength, maxLength, email, cc etc.*/
  validationRules: undefined,

  /** Template to show when validation fails */
  validationMessages: {
    required: 'required',
    minLength: 'Must be at least {{param0}} chars',
    maxLength: 'Must not be more than {{param0}} chars',
    email: 'Not a valid email address',
    number: 'Must be a number',
    minValue: 'Must be >= {{param0}}',
    maxValue: 'Must be <= {{param0}}'
  },

  /** error, warning, success. Cleared on model load */
  validationState: undefined,

  /** message to display next to field, eg error message */
  message: undefined,


  constructor: function(options){
    options = options || {};

    this.validationMessages = _.extend({},this.validationMessages, options.validationMessages);
    delete options.validationMessages;

    View.apply(this, arguments);
  },

  /**
   * An editable view for displaying and editing a single value of a model.
   *
   * The value displayed (the view value) is allowed to differ from the model's value
   * until updateModel is called.
   *
   * To automatically update the model on change set updateModelOnChange = true.
   *
   * Notes:
   *  - In order to be used in a Form, Field subclasses must render an input element.
   *  - The rendered dom also has state. The view value *must* be kept in sync with the
   *    DOM value in case the field needs to be rerendered. By default this is done by setting
   *    the view value to the result of getValueFromDom when the DOM value changes.
   *     - Make sure to override getValueFromDom if your rendered DOM is not an input tag.
   *  - When triggering a change event, make sure both DOM and backbone events are triggered.
   *    Since a DOM event triggers a backbone event, do this by triggering a DOM event.
   *
   * @constructs
   * @extends Plumage.view.ModelView
   */
  initialize: function(options) {
    options = options || {};
    this.validationMessages = _.extend({},this.validationMessages, options.validationMessages);
    delete options.validationMessages;

    ModelView.prototype.initialize.apply(this, arguments);
    this.className = this.className ? this.className + ' field' : 'field';
  },

  onRender: function() {
    var inputEl = this.getInputEl();
    var hasFocus = inputEl ? inputEl.is(':focus') : false;
    Handlebars.registerPartial('field', this.fieldTemplate);
    ModelView.prototype.onRender.apply(this, arguments);

    this.$el.addClass(this.validationState);

    inputEl = this.getInputEl();
    if (inputEl && hasFocus) {
      inputEl.focus();
    }
  },

  // This implementation avoids rerendering (and losing cursor position),
  // however, it has to be overridden frequently.
  // Maybe move this into a subclass TextField?
  update: function(isLoad) {
    if (this.isRendered) {
      var val = this.getInputEl().val(),
        newVal = this.processValueForDom(this.getValue());
      if (val !== newVal) {
        this.getInputEl().val(newVal);
      }
    } else {
      this.render();
    }
  },

  //
  // Init Events
  //

  delegateEvents: function(events) {
    events = events || _.result(this, 'events');
    var selector = this.getInputSelector();
    if (selector) {
      events = _.clone(events || {});
      events['blur ' +selector] = 'onBlur';
      events['focus ' +selector] = 'onFocus';
      events['submit ' +selector] = 'onSubmit';
      events['change ' +selector] = 'onChange';
      events['input ' +selector] = 'onInput'; //for text fields
      events['keydown ' +selector] = 'onKeyDown'; //detect enter/escape etc
      events['mouseup ' +selector] = 'onChange'; //for select/checkbox etc
    }
    Backbone.View.prototype.delegateEvents.apply(this, [events]);
  },

  undelegateEvents: function() {
    Backbone.View.prototype.undelegateEvents.apply(this, arguments);
    var inputEl = this.getInputEl();
    if (inputEl) {
      inputEl.off('.field');
    }
  },

  getInputSelector: function() {
    return this.$el.is(':input') ? '' : ':input:first';
  },

  getInputEl: function() {
    if (!this.el) {
      return undefined;
    }
    var selector = this.getInputSelector();
    return selector ? this.$(selector).first() : this.$el;
  },

  hasValue: function() {
    var value = this.getValue();
    return value !== null && value !== undefined && value !== '';
  },

  //
  // Modifiers
  //

  focus: function() {
    this.getInputEl().focus();
  },

  setDisabled: function(disabled) {
    if (this.disabled !== disabled) {
      this.disabled = disabled;
      this.render();
    }
  },

  //
  // Overrides
  //

  getTemplateData: function() {
    var data = {
      fieldType: this.fieldType,
      label: this.getLabel(),
      valueAttr: this.valueAttr,
      value: this.processValueForDom(this.getValue()),
      hasValue: this.hasValue(),
      placeholder: this.placeholder,
      readonly: this.readonly,
      disabled: this.disabled,
      validationState: this.validationState,
      message: this.message
    };
    return data;
  },

  setModel: function() {
    ModelView.prototype.setModel.apply(this, arguments);
    this.setValidationState(null, null);
    this.updateValueFromModel();
  },

  ensureData: function() {
    ModelView.prototype.ensureData.apply(this, arguments);
  },

  //
  // Attributes
  //

  getValue: function() {
    return this.value;
  },

  processValueForDom: function(value) {
    return value;
  },

  /**
   * updates the field value, and triggers change (both plumage and dom events)
   *
   * Note: This is not the only path to change the field value. The field value can also be changed by
   * updateValueFromModel, so do not update non-model view state here. Do that in valueChanged.
   */
  setValue: function(newValue, options) {
    options = options || {};
    if (this.getValue() === newValue) {
      return;
    }
    this.value = newValue;

    if (this.updateModelOnChange && this.model) {
      this.updateModel(this.rootModel);
    } else {
      this.update();
    }

    this.valueChanged();

    if (!options.silent) {
      this.changing = true;
      this.trigger('change', this, this.getValue());

      //for catching in form
      this.triggerChange();
      this.changing = false;
    }
  },

  getLabel: function() {
    if (this.labelAttr) {
      return this.model ? this.model.get(this.labelAttr) : null;
    }
    return this.label;
  },

  blur: function() {
    this.$el.blur();
  },

  onShow: function() {
    ModelView.prototype.onShow.apply(this, arguments);
  },

  //
  // Validation
  //

  validators: {
    required: function(value, params) {
      return value !== undefined && value !== null && value !== '';
    },
    minLength: function(value, params) {
      return value.length >= params;
    },
    maxLength: function(value, params) {
      return value.length <= params;
    },
    email: function(value) {
      return value ? (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(value) : true;
    },
    number: function(value) {
      return !isNaN(value) && !isNaN(Number(value));
    },
    minValue: function(value, params) {
      return value >= params[0];
    },
    maxValue: function(value, params) {
      return value <= params[0];
    }
  },

  setValidationState: function(state, message) {
    if (this.validationState) {
      this.$el.removeClass(this.validationState);
    }
    this.validationState = state;
    this.message = message;

    this.$el.addClass(this.validationState);
    this.$('.help-inline').html(this.message);
  },

  validate: function() {
    return this.validateValue(this.getValue());
  },

  validateValue: function(value) {
    var rules = this.validationRules;

    if (rules) {
      if (!$.isPlainObject(rules)) {
        //eg 'required'
        var newRules = {};
        newRules[rules] = true;
        rules = newRules;
      }

      var success = true;
      //check required first
      if (rules.required) {
        success = this.applyValidator(value, rules.required, 'required');
      }
      if (success) {
        _.keys(rules).every(function(k) {
          if (k === 'required') {
            return true;
          }
          return success = this.applyValidator(value, rules[k], k);
        }.bind(this));
      }
      if (success) {
        this.setValidationState(null,null);
      }
      return success;
    }
    return true;
  },

  applyValidator: function(value, params, name) {
    var validator;
    if ($.isFunction(params)) {
      validator = params;
      params = [];
    } else {
      params = $.isArray(params) ? params : [params];
      validator = this.validators[name];
    }

    if (!validator(value, params)) {
      var message = this.getValidationMessage(name, params);
      this.setValidationState('error', message);
      return false;
    }
    return true;
  },

  getValidationMessage: function(name, params) {
    var message = this.validationMessages[name] || 'invalid';
    return Handlebars.compile(message)(_.object(_.map(params, function(x, i) {return ['param' + i, x];})));
  },

  ////
  //
  // Helpers
  //
  ////


  //
  // View value <--> Model
  //

  isValid: function() {
    return this.validate();
  },

  updateModel: function(rootModel, parentModel) {
    var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
      value = this.disabled ? null : this.getValue();
    return model.set(this.valueAttr, value) !== false;
  },

  updateValueFromModel: function() {
    this.value = '';
    if (this.model) {
      this.value = this.getValueFromModel();
      this.valueChanged(true);

      if (this.isRendered) {
        this.update();
      }
    }
  },

  getValueFromModel: function() {
    if (this.model) {
      var result = this.model.get(this.valueAttr);
      return result === undefined ? '' : result;
    }
  },

  //
  // View value <--> DOM value
  //

  getValueFromDom: function() {
    var inputEl = this.getInputEl();
    if (inputEl && inputEl.val) {
      return inputEl.val();
    }
  },

  processDomValue: function(value) {
    return value;
  },

  //
  // Gets current value from model
  //

  triggerChange: function(query) {
    //trigger change by blurring to prevent 2nd change event on blur
    var el = this.getInputEl();
    if (el.is(':focus')) {
      el.blur();
      el.focus();
    } else {
      el.change();
    }
  },

  /**
   * Use this to completely disallow invalid values from being set.
   * this is different from validationRules. If a value doesn't pass isDomValueValid, it will be reverted before
   * validation happens.
   */
  isDomValueValid: function(value) {
    if (this.updateModelOnChange) {
      return this.validateValue(value);
    }
    return true;
  },

  updateValueFromDom: function() {
    var newValue = this.getValueFromDom();

    if (this.isDomValueValid(newValue)) {
      newValue = this.processDomValue(newValue);
      if (!this.changing) {
        this.setValue(newValue, {silent: true});
      }
      this.trigger('change', this, this.getValue());
    } else {
      this.update();
    }
  },

  /**
   * Hook called when value changes. Useful for keeping view state in sync.
   * @param {Boolean} fromModel Being called from updateValueFromModel?
   */
  valueChanged: function(fromModel) {
    return;
  },

  //
  // Event handlers
  //

  onChange: function(e) {
    this.updateValueFromDom();
  },

  onInput: function(e) {
    this.updateValueFromDom();
  },

  onKeyDown: function(e) {
    //do nothing
  },

  onBlur: function(e) {
    this.updateValueFromDom();
    this.validate();
    this.trigger('blur', this);
  },

  onFocus: function(e){
    //do nothing
  },

  onSubmit: function(e) {
    this.trigger('submit', this);
  },

  onModelChange: function (e) {
    if (e.changed[this.valueAttr] !== undefined) {
      this.updateValueFromModel();
    }
  },

  onModelLoad: function () {
    this.setValidationState(null, null);
    this.updateValueFromModel();
  },

  onModelInvalid: function(model, validationError) {
    if (validationError) {
      var message = validationError[this.valueAttr];
      if (message) {
        if ($.isArray(message)) {
          message = message[0];
        }
        this.setValidationState('error', message);
      }
    }
  }
});
