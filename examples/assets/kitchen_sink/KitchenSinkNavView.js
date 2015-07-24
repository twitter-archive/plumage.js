/* globals $, _ */

var Plumage = require('plumage');

module.exports = Plumage.view.NavView.extend({

  title: 'PlumageJS',
  titleUrl: '/plumage.js',
  subtitle: 'Kitchen Sink Example',

  userMenuItems: undefined,

  showSearch: true,

  aboutUrl: '#',

  helpUrl: '#',

  navItems: [
    {id: 'grid', label: 'Models', url: 'model', className: 'model-menu'},
    {id: 'grid', label: 'Views', url: 'view', className: 'view-menu'},
    {id: 'grid', label: 'Grids', url: 'grid', className: 'grid-menu'},
    {id: 'form', label: 'Forms', url: 'form', className: 'form-menu'},
  ],

  onNavClick: function(e) {
    var a = $(e.target), li = $(a.parent());
    e.preventDefault();

    window.router.navigate(a.attr('href'), {trigger:true});
  },

  onLinkClick: function(e) {
    //do nothing to allow out link
  }
});
