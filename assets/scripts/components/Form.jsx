import React, {PropTypes} from 'react';

export default class Form extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    onSubmit: PropTypes.func,
    onFormChange: PropTypes.func,
    children: PropTypes.node
  };

  static childContextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    className: 'form-horizontal'
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

  onSubmit(e) {
    e.preventDefault();
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }
  }

  render() {
    return (<form className={this.props.className} onSubmit={this.onSubmit}>
      {this.props.children}
    </form>);
  }
}