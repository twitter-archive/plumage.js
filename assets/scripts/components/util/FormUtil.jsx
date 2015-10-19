import $ from 'jquery';

import Collection from 'collection/Collection';

//
// Functions for modifying Models and Collections, based on Form changes.
//

function doUpdate(state, changeData) {
  for (let key in changeData) {
    if (typeof(changeData[key]) === 'object') {
      if (state[key] === undefined) {
        state[key] = {};
      }
      doUpdate(state[key], changeData[key]);
    } else {
      state[key] = changeData[key];
    }
  }
}

function doDelete(state, changeData) {
  for (let key in changeData) {
    if (state[key] === undefined) {
      continue;
    }
    if (typeof(changeData[key]) === 'object') {
      doDelete(state[key], changeData[key]);
    } else if (changeData[key]) {
      if (Array.isArray(state)) {
        state.splice(key, 1);
      } else {
        delete state[key];
      }
    }
  }
}

function doUpdateFilters(model, filters) {
  if (filters) {
    for (let key in filters) {
      if (!filters.hasOwnProperty(key)) {
        continue;
      }
      let filterValue = filters[key];
      if (filterValue) {
        model.setFilter(key, filterValue);
      } else {
        model.removeFiltersForKey(key);
      }
    }
  }
}

function doUpdateToModel(model, changeData) {
  for (let key in changeData) {
    if (key === 'filters' && model instanceof Collection) {
      doUpdateFilters(model, changeData.filters);
    } else if (typeof(changeData[key]) === 'object') {
      let nextModel;
      if (model instanceof Collection) {
        nextModel = model.at(Number(key));
        doUpdateToModel(nextModel, changeData[key]);
      } else {
        nextModel = model.getRelated(key);
        if (nextModel === undefined) {
          model.instantiateRelationship(key, changeData[key], model.relationships[key]);
        } else {
          doUpdateToModel(nextModel, changeData[key]);
        }
      }
    } else {
      model.set(key, changeData[key]);
    }
  }
}

function doDeleteToModel(model, changeData) {
  for (let key in changeData) {
    if (typeof(changeData[key]) === 'object') {
      if (model.getRelated(key) === undefined) {
        continue;
      } else {
        doDeleteToModel(model.getRelated(key), changeData[key]);
      }
    } else if (changeData[key]) {
      if (model instanceof Collection) {
        model.remove(model.at(key));
      } else {
        model.set(key, undefined);
      }
    }
  }
}

export default {
  applyFormChanges: function(state, changeType, changeData) {
    let newState = $.extend(true, {}, state);
    switch (changeType) {
    case 'update':
      doUpdate(newState, changeData);
      break;
    case 'delete':
      doDelete(newState, changeData);
      break;
    case 'create':
      throw new Error('Not implemented');
    default:
      break;
    }
    return newState;
  },

  applyFormChangesToModel: function(model, changeType, changeData) {
    switch (changeType) {
    case 'update':
      doUpdateToModel(model, changeData);
      break;
    case 'delete':
      doDeleteToModel(model, changeData);
      break;
    case 'create':
      throw new Error('Not implemented');
    default:
      break;
    }
  }
};