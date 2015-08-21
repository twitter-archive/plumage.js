import formDataToObj from 'form-data-to-object';
import $ from 'jquery';

import Collection from 'collection/Collection';


function doUpdate(state, changeData) {
  for (var key in changeData) {
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
  for (var key in changeData) {
    if (state[key] === undefined) {
      continue;
    }
    if (typeof(changeData[key]) === 'object') {
      doDelete(state[key], changeData[key]);
    } else if (changeData[key]) {

      if (Array.isArray(state)) {
        state.splice(key, 1)
      } else {

        delete state[key];
      }
    } else {
      console.log('nothing to do with: ' + key)
    }
  }
}

function doUpdateToModel(model, changeData) {
  for (var key in changeData) {
    if (typeof(changeData[key]) === 'object') {
      var nextModel;
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
  for (var key in changeData) {
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
    } else {
      console.log('nothing to do with: ' + key)
    }
  }
}


export default {
  applyFormChanges: function(state, changeType, changeData) {
    var newState = $.extend(true, {}, state);
    changeData = formDataToObj.toObj(changeData);
    switch (changeType) {
      case 'update':
        doUpdate(newState, changeData);
        break;
      case 'delete':
        doDelete(newState, changeData);
        break;
      case 'create':
        throw "Not implemented";
        break;
    }
    return newState;
  },

  applyFormChangesToModel: function(model, changeType, changeData) {
    changeData = formDataToObj.toObj(changeData);
    switch (changeType) {
      case 'update':
        doUpdateToModel(model, changeData);
        break;
      case 'delete':
        doDeleteToModel(model, changeData);
        break;
      case 'create':
        throw "Not implemented";
        break;
    }
  },
}