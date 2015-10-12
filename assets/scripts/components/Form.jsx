import React, {PropTypes} from 'react';

export default class Form extends React.Component {

  static propTypes = {
    onSubmit: PropTypes.func,
    onChange: PropTypes.func
  };

  static defaultProps = {
    className: 'form-horizontal'
  };

  static childContextTypes = {
    onFormChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {};

    this.onSubmit = this.onSubmit.bind(this);
  }

  getChildContext() {
    return {
      onFormChange: this.props.onFormChange
    };
  }

  render() {
    return <form className={this.props.className} onSubmit={this.onSubmit}>
      {this.props.children}
    </form>;
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }
  }
};