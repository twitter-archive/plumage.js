import React from 'react';

/**
 * Wraps
 *
 */
export default function modelComponent(Component) {
  class Wrapper {
    render() {
      return <Component {...this.getChildProps()} />;
    }

    getChildProps() {
      var modelProps = {};
      if (this.props.modelKeys) {
        for (let key in this.props.modelKeys) {
          modelProps[key] = this.getModelValue(this.props.model, this.props.modelKeys[key]);
        }
      }
      var result = _.extend(modelProps, this.props);
      delete result.modelKeys;
      return result;
    }

    getModelValue(model, modelKey) {
      var parts = modelKey.split('.');
      var result = model;
      for (var i=0;i<parts.length;i++) {
        if (result === undefined) {
          break;
        }
        result = result[parts[i]];
      }
      return result;
    }
  }

  return Wrapper;


}