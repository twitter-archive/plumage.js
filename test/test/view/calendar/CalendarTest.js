/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'sinon',
  'test/environment',
  'test/EventLog',
  'view/calendar/Calendar'
], function($, _, Backbone, moment, sinon, Environment, EventLog, Calendar) {


  //use Environment to mock ajax
  module('Calendar', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    return new Calendar(_.extend({year: 2014, month: 0}, options));
  }


  //       Jan 2014
  //  S| M| T| W| T| F| S
  // 29|30|31| 1| 2| 3| 4
  //  5| 6| 7| 8| 9|10|11
  // 12|13|14|15|16|17|18
  // 19|20|21|22|23|24|25
  // 26|27|28|29|30|31| 1
  //  2| 3| 4| 5| 6| 7| 8

  test('getFirstDate', function(){
    var view = createView();

    equal(view.getFirstDate(0, 2014).format('YYYY-MM-DD'), '2013-12-29');
    equal(view.getFirstDate(5, 2014).format('YYYY-MM-DD'), '2014-05-25');
  });

  test('isSameDay', function() {
    var view = createView();
    ok(view.isSameDay(moment(), moment()));
    ok(!view.isSameDay(moment(), moment().subtract('day', 1)));
  });

  test('getClassesForDate', function(){
    var view = createView();

    //remember months are 0 indexed
    deepEqual(view.getClassesForDate(moment([2013, 11, 29]), 0, 1), ['active', 'off', 'shadow-bottom']);
    deepEqual(view.getClassesForDate(moment([2014, 0, 15]), 2, 3), ['active']);
    deepEqual(view.getClassesForDate(moment([2014, 1, 1]), 4, 6), ['active', 'off', 'shadow-top-left']);

    view.minDate = moment([2013,11,31]);
    view.maxDate = moment([2014,0,22]);
    view.selectedDate = moment([2014,0,15]);

    deepEqual(view.getClassesForDate(moment([2013, 11, 30]), 0, 4), ['disabled', 'off', 'shadow-bottom']);
    deepEqual(view.getClassesForDate(moment([2013, 11, 31]), 0, 2), ['active', 'off', 'shadow-bottom-right']);
    deepEqual(view.getClassesForDate(moment([2014, 0, 15]), 2, 3), ['active', 'selected']);
  });

  test('getCalendarDates', function () {
    var view = createView();
    var calendar = view.getCalendarDates(0, 2014);
    ok(view.isSameDay(calendar[1][1].date, moment([2014,0,6,12])));
  });
});
