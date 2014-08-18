define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/DropdownSelect',
  'bootstrap'
], function($, _, Backbone, Handlebars, moment, Plumage, DropdownSelect, template) {

  return Plumage.view.form.fields.HourSelect = DropdownSelect.extend({
    className: 'hour-select',

    minDate: undefined,
    maxDate: undefined,

    minDateAttr: undefined,
    maxDateAttr: undefined,

    /** optional. For displaying a selected range. */
    fromAttr: undefined,

    /** optional. For displaying a selected range. */
    toAttr: undefined,

    hourFormat: 'ha',

    utc: false,

    initialize: function(options) {
      this.listValues = _.map(_.range(24), function(x){
        return {
          value: x,
          label: moment({hour: x}).format(this.hourFormat)
        };
      }.bind(this));
      DropdownSelect.prototype.initialize.apply(this, arguments);
    },



    getTemplateData: function() {
      var data = DropdownSelect.prototype.getTemplateData.apply(this, arguments);
      _.each(data.listValues, function(x) {
        x.classes = this.getClassesForHour(x.value).join(' ');
      }, this);
      return data;
    },

    getValueFromModel: function() {
      if (this.model) {
        var result = this.model.get(this.valueAttr);
        if (result > 1000) {
          var m = this.utc ? moment.utc(result) : moment(result);
          result = m.hour();
        }
        return result === undefined ? '' : result;
      }
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var modelValue = model.get(this.valueAttr);
      var m = this.utc ? moment.utc(modelValue) : moment(modelValue);
      value = m.hour(value).valueOf();

      return model.set(this.valueAttr, value);
    },

    getMinDate: function() {
      if (this.model && this.minDateAttr) {
        return this.model.get(this.minDateAttr);
      }
      return this.minDate;
    },

    setMinDate: function(minDate) {
      this.minDate = minDate;
      this.update();
    },

    /**
     * Set the maximum selectable date (inclusive)
     */
    getMaxDate: function() {
      if (this.model && this.maxDateAttr) {
        return this.model.get(this.maxDateAttr);
      }
      return this.maxDate;
    },

    setMaxDate: function(maxDate) {
      this.maxDate = maxDate;
      this.update();
    },

    setValue: function(value) {
      if (!this.isHourInMinMax(value)) {
        return;
      }
      DropdownSelect.prototype.setValue.apply(this, arguments);
    },

    //
    // Helpers
    //

    getClassesForHour: function(hour) {
      var m = this.getDate(hour);
      var classes = [
        this.isHourInMinMax(hour) ? null : 'disabled',
        hour === this.getValue() ? 'selected' : null,
        this.isHourInSelectedRange(hour) ? 'in-range' : null,
        this.isHourOtherSelection(hour) ? 'other-selected' : null
      ];
      return _.compact(classes);
    },

    isHourInMinMax: function(hour) {
      if (!this.model) {
        return true;
      }

      var minDate = this.getMinDate(),
        maxDate = this.getMaxDate();

      var m = this.getDate(hour);

      return (!minDate || m >= moment(minDate)) && (!maxDate || m <= moment(maxDate));
    },

    isHourInSelectedRange: function(hour) {
      if (!this.model || !this.fromAttr || !this.toAttr) {
        return false;
      }
      var fromDate = this.model.get(this.fromAttr),
        toDate = this.model.get(this.toAttr);

      if (!fromDate || !toDate) {
        return false;
      }

      var m = this.getDate(hour);
      return m.valueOf() >= fromDate &&  m.valueOf() <= toDate;
    },

    isHourOtherSelection: function(hour) {
      if (!this.model || !this.fromAttr || !this.toAttr || hour === this.getValue()) {
        return false;
      }
      var fromDate = this.model.get(this.fromAttr),
        toDate = this.model.get(this.toAttr);

      if (!fromDate || !toDate) {
        return false;
      }
      var m = this.getDate(hour);
      return m.valueOf() === fromDate ||  m.valueOf() === toDate;
    },

    getDate: function(hour) {
      var modelValue = this.model && this.model.get(this.valueAttr), m;
      if (modelValue !== undefined) {
        m = this.utc ? moment.utc(modelValue) : moment(modelValue);
      } else {
        m = this.utc ? moment.utc() : moment();
      }
      return m.hour(hour);
    },


    onModelChange: function (e) {
      if (e.changed[this.valueAttr] !== undefined || e.changed[this.minDateAttr] !== undefined || e.changed[this.maxDateAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },
  });
});