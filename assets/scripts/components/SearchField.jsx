import React, {PropTypes} from 'react';

import FieldUtil from './util/FieldUtil';

export default class SearchField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onCommit: PropTypes.func,
    onFormChange: PropTypes.func,
    onChange: PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSearchClick = this.onSearchClick.bind(this);
  }

  //
  // Events
  //

  onChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
    FieldUtil.setFieldValue(this, e.target.value);
  }

  onKeyDown(e) {
    switch (e.key) {
    case 'Enter':
      e.preventDefault();
      this.commit();
      break;
    default:
      break;
    }
  }

  onSearchClick() {
    this.commit();
  }

  commit() {
    if (this.props.onCommit) {
      this.props.onCommit(this.props.value);
    }
  }

  render() {
    return (<div className={'search-field' + (this.props.className || '')}>
      <input ref="input" type="text"
             name={this.props.name}
             className={'form-control ' + (this.props.className || '')}
             placeholder={this.props.placeholder}
             value={this.props.value}
             onChange={this.onChange}
             onKeyDown={this.onKeyDown}
      />

      <button onClick={this.onSearchClick}>
        <span className="glyphicon glyphicon-search"></span>
      </button>
    </div>);
  }
}