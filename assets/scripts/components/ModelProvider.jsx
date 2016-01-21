import React, {PropTypes} from 'react';

import Model from 'model/Model';

export default class ModelProvider extends React.Component {
  static propTypes = {
    model: PropTypes.instanceOf(Model),
    children: PropTypes.node
  };

  static childContextTypes = {
    model: PropTypes.instanceOf(Model)
  };

  constructor(props) {
    super(props);
  }

  getChildContext() {
    return {
      model: this.props.model
    };
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}