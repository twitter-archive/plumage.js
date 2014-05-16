define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {

  /**
   * Creates and keeps the singleton Controller instances.
   *
   * The instance of ControllerManager. Access the ControllerManager through the global App.
   * @constructs Plumage.ControllerManager
   */
  var ControllerManager = function(app, controllerNames) {
    this.app = app;

    /** Hash of id to controller instances */
    this.controllers = {};

    /** List of controller names. Controllers must be in the controller/ requirejs path */
    this.controllerNames = controllerNames;

    this.initialize.apply(this, arguments);
  };

  _.extend(ControllerManager.prototype,
  /** @lends Plumage.ControllerManager.prototype */
  {
    initialize: function() {
      this.initControllers();
    },

    /** get a controller by id */
    getController: function(id) {
      return this.controllers[id];
    },

    /** Create and store the controllers in controllerNames */
    initControllers: function() {
      _.each(this.controllerNames, function(name){
        var className = name;
        if (className.indexOf('/') < 0) {
          className = 'controller/' + className;
        }
        var cls = requirejs(className);
        this.controllers[name] = new cls(this.app);
      }, this);
    }
  });

  return Plumage.ControllerManager = ControllerManager;
});