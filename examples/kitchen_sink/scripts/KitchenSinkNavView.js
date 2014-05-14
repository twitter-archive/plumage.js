define([
  'jquery',
  'backbone',
  'handlebars',
  'plumage',
  'bootstrap'
], function($, Backbone, Handlebars, Plumage) {

  return Plumage.view.NavView.extend({

    title: 'PlumageJS',
    subtitle: 'Kitchen Sink Example',

    userMenuItems: undefined,

    showSearch: false,

    navItems: [
      {id: 'grid', label: 'Models', url: '/examples/kitchen_sink/model', className: 'model-menu'},
      {id: 'grid', label: 'Views', url: '/examples/kitchen_sink/view', className: 'view-menu'},
      {id: 'grid', label: 'Grids', url: '/examples/kitchen_sink/grid', className: 'grid-menu'},
      {id: 'form', label: 'Forms', url: '/examples/kitchen_sink/form', className: 'form-menu'},
    ],

    onNavClick: function(e) {
      var a = $(e.target), li = $(a.parent());
      e.preventDefault();
      window.router.navigate(a.attr('href'), {trigger:true});
    }
  });
});
