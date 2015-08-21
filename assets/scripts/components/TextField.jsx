
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class TextField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    onCommit: PropTypes.func,
    onCancel: PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  render() {
    return <input ref="field" type="text" name={this.props.name} className="form-control" placeholder={this.props.placeholder}
             value={this.props.value} onChange={this.onChange} onBlur={this.onBlur}/>;
  }

  //
  // Events
  //


  onChange(e) {
    if (this.context.onFormChange) {
      var values = {};
      values[this.props.name] = e.target.value;
      this.context.onFormChange(values);
    }
  }


}