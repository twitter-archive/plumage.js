import formDataToObj from 'form-data-to-object';
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class TextField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    onCommit: PropTypes.func,
    onCancel: PropTypes.func,
    onFormChange: React.PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  render() {
    return <input ref='input' type='text'
                  name={this.props.name}
                  className={'form-control ' + (this.props.className || '')}
                  placeholder={this.props.placeholder}
                  value={this.props.value}
                  onChange={this.onChange}
      />;
  }

  //
  // Events
  //

  onChange(e) {
    FieldUtil.setFieldValue(this, e.target.value);
  }
}