jest.dontMock('../Calendar.jsx');
jest.dontMock('moment');


describe('Calendar', function() {
  let React;
  let TestUtils;
  let moment;
  let Calendar;
  let calendar;

  beforeEach(function() {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    moment = require('moment');
    Calendar = require('../Calendar.jsx');

    calendar = TestUtils.renderIntoDocument(
      <Calendar year="2014" month="0" value={moment([2014, 0, 3]).valueOf()}/>
    );
  });

  //       Jan 2014
  //  S| M| T| W| T| F| S
  // 29|30|31| 1| 2| 3| 4
  //  5| 6| 7| 8| 9|10|11
  // 12|13|14|15|16|17|18
  // 19|20|21|22|23|24|25
  // 26|27|28|29|30|31| 1
  //  2| 3| 4| 5| 6| 7| 8

  it('sets initial state from props', function() {
    expect(calendar.state.year).toEqual(2014);
    expect(calendar.state.month).toEqual(0);
    expect(calendar.state.value).toEqual(moment([2014, 0, 3]).valueOf());
  });

  it('renders', function() {
    let title = TestUtils.findRenderedDOMComponentWithClass(calendar, 'calendar-title');
    expect(title.textContent).toEqual('Jan 2014');

    let days = TestUtils.scryRenderedDOMComponentsWithClass(calendar, 'day');
    expect(days.length).toEqual(7 * 6);
    expect(days[0].textContent).toEqual('29');
    expect(days[days.length - 1].textContent).toEqual('8');

    let tds = TestUtils.scryRenderedDOMComponentsWithTag(calendar, 'td');
    expect(tds[4].className).toNotContain('selected');
    expect(tds[5].className).toContain('selected');
  });

  it('can change month', function() {
    let title = TestUtils.findRenderedDOMComponentWithClass(calendar, 'calendar-title');
    let prev = TestUtils.findRenderedDOMComponentWithClass(calendar, 'prev');
    let next = TestUtils.findRenderedDOMComponentWithClass(calendar, 'next');

    TestUtils.Simulate.click(prev);
    expect(title.textContent).toEqual('Dec 2013');

    TestUtils.Simulate.click(next);
    TestUtils.Simulate.click(next);
    expect(title.textContent).toEqual('Feb 2014');
  });

  //
  // Helpers
  //

  describe('getFirstDateTuple', function() {
    it('returns first date on month page', function() {
      expect(calendar.getFirstDateTuple(0, 2014)).toEqual([2013, 11, 29]);
      expect(calendar.getFirstDateTuple(5, 2014)).toEqual([2014, 4, 25]);
    });
  });

  describe('getClassesForDate', function() {
    it('returns "off" when date is not in the current month', function() {
      expect(calendar.getClassesForDate([2013, 11, 29])).toContain('off');
      expect(calendar.getClassesForDate([2013, 0, 15])).toNotContain('off');
      expect(calendar.getClassesForDate([2014, 1, 1])).toContain('off');
    });

    it('returns "selected" for selected date', function() {
      expect(calendar.getClassesForDate([2014, 0, 3])).toContain('selected');
      expect(calendar.getClassesForDate([2013, 0, 4])).toNotContain('selected');
    });
  });
});
