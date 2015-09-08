
import React, {PropTypes} from 'react';
import _ from 'underscore';

import TextField from './TextField'

export default class SearchField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    onCommit: PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.onSearchClick = this.onSearchClick.bind(this);
  }

  render() {
    return <div className={'search-field' + (this.props.className || '')}>
      <TextField className='search-query' {...this.props}/>
      <button onClick={this.onClick}>
        <span className="glyphicon glyphicon-search"></span>
      </button>
    </div>
  }

  //
  // Events
  //

  onSearchClick(e) {
    if (this.props.onCommit) {
      this.props.onCommit(this, this.props.value);
    }
  }
}