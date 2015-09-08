import formDataToObj from 'form-data-to-object';

export default {
  setFieldValue: function(field, value, extraState, callback) {
    var newValues = {};
    newValues[field.props.name] = value;
    var changeData = formDataToObj.toObj(newValues);

    if (field.props.value !== value) {
      if (field.props.onFormChange) {
        field.props.onFormChange('update', changeData);
      }

      if (field.context.onFormChange) {
        field.context.onFormChange('update', changeData);
      }
    }
  }
}