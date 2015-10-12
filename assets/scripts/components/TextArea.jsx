import formDataToObj from 'form-data-to-object';
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class TextArea extends React.Component {

  static propTypes = {
    id: PropTypes.string,
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
    return <textarea ref='input'
                  id={this.props.id}
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