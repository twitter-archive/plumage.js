/* global runs, waitsFor, spyOn */
import _ from 'underscore';

jest.dontMock('../TypeAheadResults');

describe('TypeAheadResults', function() {
  let React;
  let TestUtils;
  let TypeAheadResults;
  let renderComponent;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    TypeAheadResults = require('../TypeAheadResults.jsx');

    renderComponent = (props) => {
      let theProps = _.extend({}, {
        results: [
          {label: 'bar1', value: 'bar1'},
          {label: 'bar2', value: 'bar2'}
        ],
        selectedIndex: 0
      }, props);
      return TestUtils.renderIntoDocument(
        <TypeAheadResults {...theProps}/>
      );
    };
  });

  it('renders result data', () => {
    let typeAheadResults = renderComponent();

    let liEls = TestUtils.scryRenderedDOMComponentsWithTag(typeAheadResults, 'li');
    expect(liEls[0].getAttribute('data-value')).toEqual('bar1');
    expect(liEls[0].getAttribute('data-index')).toEqual('0');
    expect(liEls[1].getAttribute('data-index')).toEqual('1');

    expect(liEls[0].className).toEqual('active');
    expect(liEls[1].className).toEqual('');
  });

  it('renders title and more link', () => {
    let typeAheadResults = renderComponent({title: 'title', moreLabel: 'more', moreUrl: '/more'});

    let titleEl = TestUtils.findRenderedDOMComponentWithClass(typeAheadResults, 'section-title');
    expect(titleEl.textContent).toEqual('title');

    let moreEl = TestUtils.findRenderedDOMComponentWithClass(typeAheadResults, 'more');

    expect(moreEl.textContent).toEqual('more');
  });

  it('accounts for startIndex for rendering active', () => {
    let typeAheadResults = renderComponent({startIndex: 4, selectedIndex: 5});
    let liEls = TestUtils.scryRenderedDOMComponentsWithTag(typeAheadResults, 'li');
    expect(liEls[1].className).toEqual('active');
  });
});