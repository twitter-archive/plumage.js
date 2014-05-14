/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'view/View',
  'view/ContainerView',
  'text!test/templates/TestView.html'
], function($, _, Backbone, sinon, Environment, EventLog, View, ContainerView, template) {


  //use Environment to mock ajax
  module('ContainerView', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  test('renders subviews', function(){
    var view = new ContainerView({
      el: $('<div></div>'),
      template: '<div class="section1"></div><div class="section2"></div>',
      subViews: [
        new ContainerView({
          selector: '.section1',
          template: 'foo'
        }),
        new ContainerView({
          selector: '.section2',
          template: 'bar',
          replaceEl: true
        })
      ]
    });

    view.render();

    equal(view.$el.html(), '<div class="section1"><div>foo</div></div><div class="section2">bar</div>');
  });

  test('getSubView', function(){
    var view = new ContainerView({
      el: $('<div></div>'),
      template: '<div class="section1"></div><div class="section2"></div>',
      subViews: [
        new ContainerView({
          name: 'section1',
          selector: '.section1',
          template: '<div class="subsection"></div>',
          subViews: [
            new ContainerView({
              name: 'subsection',
              selector: '.subsection',
              template: 'bar'
            })
          ]
        })
      ]
    });

    equal(view.getSubView('section1').name, 'section1');

    equal(view.getSubView('section1.subsection').name, 'subsection');

    equal(view.getSubView('sdfsdf.asdfad'), undefined);


  });
});