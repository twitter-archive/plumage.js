import { Component, createElement, PropTypes} from 'react';
import invariant from 'invariant';
import isPlainObject from '../util/isPlainObject';

import Model from 'model/Model';

export default function connectModel(mapModelToProps) {
  function defaultMapModelToProps(model) {
    if (!model) {
      return {};
    }
    return model.toViewJSON();
  }

  function computeModelProps(model) {
    const modelProps = mapModelToProps ? mapModelToProps(model) : defaultMapModelToProps(model);

    invariant(
      isPlainObject(modelProps),
      '`mapModelToProps` must return an object. Instead received %s.',
      modelProps
    );
    return modelProps;
  }

  return function wrapWithConnectModel(WrappedComponent) {
    return class ConnectModel extends Component {
      static propTypes = {
        model: PropTypes.instanceOf(Model),
        relationship: PropTypes.string
      };

      static contextTypes = {
        model: PropTypes.instanceOf(Model)
      };

      constructor(props, context) {
        super(props, context);
        this.rootModel = props.model || context.model;

        this.updateModel();
        this.state = {model: computeModelProps(this.model)};
      }

      componentDidMount() {
        this.subscribe();
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      componentWillReceiveProps(props) {
        if (props.model) {
          this.rootModel = props.model;
          this.updateModel();
          this.setState({model: computeModelProps(this.model)});
        }
      }

      updateModel() {
        let newModel;
        if (this.rootModel) {
          if (this.props.relationship) {
            newModel = this.rootModel.getRelated(this.props.relationship);
          } else {
            newModel = this.rootModel;
          }
        }
        if (newModel !== this.model) {
          this.unsubscribe();
          this.model = newModel;
          this.subscribe();
        }
        this.ensureData();
      }

      subscribe() {
        this.unsubscribe();
        const model = this.model;
        if (model) {
          model.on('change', this.handleChange, this);
          model.on('load', this.handleChange, this);
          model.on('add', this.handleChange, this);
          model.on('remove', this.handleChange, this);
          model.on('destroy', this.handleChange, this);
          model.on('invalid', this.handleChange, this);
        }
        if (this.rootModel && this.rootModel !== model) {
          this.rootModel.on('load', this.handleRootLoad, this);
        }
      }

      unsubscribe() {
        const model = this.model;
        if (model) {
          model.off('change', this.handleChange, this);
          model.off('load', this.handleChange, this);
        }
        if (this.rootModel) {
          this.rootModel.off('load', this.handleRootLoad, this);
        }
      }

      ensureData() {
        const model = this.model;
        if (model && model.loadOnShow) {
          if (!model.fetched) {
            if (model.fetchIfAvailable()) {
              delete model.loadOnShow;
            }
          }
        }
      }

      handleChange() {
        const model = this.model;
        this.setState({model: computeModelProps(model)});
      }

      handleRootLoad() {
        this.updateModel();
        this.setState({model: computeModelProps(this.model)});
      }

      render() {
        const {relationship, ...props} = this.props;

        const mergedProps = Object.assign({}, props, this.state.model);

        return createElement(WrappedComponent, mergedProps);
      }
    };
  };
}