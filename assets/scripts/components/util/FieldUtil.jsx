import formDataToObj from 'form-data-to-object';

export default {
  setFieldValue: function(field, value) {
    let newValues = {};
    newValues[field.props.name] = value;
    let changeData = formDataToObj.toObj(newValues);

    if (field.props.value !== value) {
      if (field.props.onChange) {
        field.props.onChange(value);
      }

      if (field.props.onFormChange) {
        field.props.onFormChange('update', changeData);
      }

      if (field.context.onFormChange) {
        field.context.onFormChange('update', changeData);
      }
    }
  }
};