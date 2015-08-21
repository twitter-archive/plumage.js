
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';
import TextField from './TextField';

export default class InplaceTextField extends React.Component {

  static propTypes = TextField.propTypes;

  static contextTypes = {
    onFormChange: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      inputValue: this.props.value
    };

    this.onClick = this.onClick.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({inputValue: props.value});
  }

  render() {
    return <div className={'inplace-field' + (this.state.editing ? ' editing' : '')}>
      <div className={'field-value' + (!this.props.value ? ' no-value': '')} onClick={this.onClick}>
        <span className="glyphicon glyphicon-pencil"></span>
        <span className="value">{this.getValue()}</span>
      </div>
      <input ref="input" type="text" value={this.state.inputValue}
             className='form-control'
             placeholder={this.props.placeholder}
             onChange={this.onInputChange}
             onBlur={this.onBlur}
             onKeyDown={this.onKeyDown}/>
    </div>
  }


  getValue() {
    var value = this.props.value;
    if (!value) {
      return this.props.placeholder
    }
    return value;
  }

  commit() {
    this.setState({editing: false});
    FieldUtil.setFieldValue(this, this.state.inputValue);
  }

  cancel() {
    this.setState({editing: false, inputValue: this.props.value});
  }

  //
  // Events
  //

  onClick() {
    this.setState({editing: true}, () => {
      this.refs.input.focus();
    });

  }

  onInputChange(e) {
    this.setState({inputValue: e.target.value});
  }

  onBlur(e) {
    this.commit();
  }

  onKeyDown(e) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        this.commit();
        break;
      case "Escape":
        e.preventDefault();
        this.cancel();
        break;
    }
  }
}