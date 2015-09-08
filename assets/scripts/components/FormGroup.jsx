import React from 'react';

export default class FormGroup {
  render() {
    return <div className={'form-group ' + (this.props.className || '')}>
      {this.props.label ? <label className="control-label">{this.props.label}</label>: null}
      <div className="controls">{this.renderChildren()}</div>
    </div>
  }

  renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      if (this.props.model) {
        return React.cloneElement(child, {
          onFormChange: this.props.onFormChange
        });
      }
      return child;
    });
  }
}