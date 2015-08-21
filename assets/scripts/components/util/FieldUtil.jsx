export default {
  setFieldValue: function(field, value, extraState, callback) {
    if (field.context.onFormChange && field.props.value !== value) {
      var newValues = {};
      newValues[field.props.name] = value;
      field.context.onFormChange('update', newValues);
    }
  }
}