/* global runs, waitsFor, spyOn */
import _ from 'underscore';

jest.dontMock('es6-promise');
require('es6-promise').polyfill();

jest.dontMock('../TypeAhead');

function getItems(value) {
  return new Promise((resolve) => {
    resolve([value + '1', value + '2']);
  });
}

describe('TypeAhead', function() {
  let React;
  let TestUtils;
  let TypeAhead;
  let renderComponent;

  let getItemsSpy;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    TypeAhead = require('../TypeAhead.jsx');

    getItemsSpy = jest.genMockFunction().mockImplementation(getItems);

    renderComponent = (props) => {
      let theProps = _.extend({}, {
        name: 'name',
        value: 'foo',
        debounceSearch: false,
        getItems: getItemsSpy
      }, props);
      return TestUtils.renderIntoDocument(
        <TypeAhead {...theProps}/>
      );
    };
  });

  it('renders initial state', function() {
    let typeAhead = renderComponent();
    let input = typeAhead.refs.input;

    expect(input.value).toEqual('foo');
    expect(input.name).toEqual('name');

    // closed
    expect(TestUtils.scryRenderedDOMComponentsWithClass(typeAhead, 'open').length).toEqual(0);
  });

  it('sets isLoading on search', function() {
    let typeAhead = renderComponent();
    let input = typeAhead.refs.input;

    expect(typeAhead.state.isLoading).toEqual(false);
    TestUtils.Simulate.change(input, {target: {value: 'bar'}});
    expect(typeAhead.state.isLoading).toEqual(true);
  });

  describe('open state', function() {
    let typeAhead;
    let input;
    beforeEach(function() {
      typeAhead = renderComponent();
      input = typeAhead.refs.input;

      runs(function() {
        TestUtils.Simulate.change(input, {target: {value: 'bar'}});
      });

      waitsFor(function() {
        return typeAhead.state.isLoading === false;
      }, 'Should finish loading', 100);
    });

    it('opens and searches on typing', () => {
      runs(function() {
        // open
        expect(TestUtils.scryRenderedDOMComponentsWithClass(typeAhead, 'open').length).toEqual(1);
        expect(input.value).toEqual('bar');
        expect(getItemsSpy.mock.calls[0]).toEqual(['bar']);

        let liEls = TestUtils.scryRenderedDOMComponentsWithTag(typeAhead, 'li');
        expect(liEls.length).toEqual(2);
        expect(liEls[0].textContent).toEqual('bar1');
      });
    });

    it('renders item data', () => {
      runs(() => {
        let liEls = TestUtils.scryRenderedDOMComponentsWithTag(typeAhead, 'li');
        expect(liEls[0].getAttribute('data-value')).toEqual('bar1');
        expect(liEls[0].getAttribute('data-index')).toEqual('0');
        expect(liEls[1].getAttribute('data-index')).toEqual('1');

        expect(liEls[0].className).toEqual('active');
        expect(liEls[1].className).toEqual('');
      });
    });

    it('can navigate items with arrow keys', function() {
      runs(function() {
        expect(typeAhead.state.selectedIndex).toEqual(0);

        TestUtils.Simulate.keyDown(input, {key: 'ArrowUp'});
        expect(typeAhead.state.selectedIndex).toEqual(0);

        TestUtils.Simulate.keyDown(input, {key: 'ArrowDown'});
        expect(typeAhead.state.selectedIndex).toEqual(1);

        TestUtils.Simulate.keyDown(input, {key: 'ArrowDown'});
        expect(typeAhead.state.selectedIndex).toEqual(1);

        TestUtils.Simulate.keyDown(input, {key: 'ArrowUp'});
        expect(typeAhead.state.selectedIndex).toEqual(0);
      });
    });

    it('enter key commits selected item', function() {
      runs(function() {
        spyOn(typeAhead, 'commit');

        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
        expect(typeAhead.commit).toHaveBeenCalledWith('bar1');
      });
    });

    it('escape key reverts to original value', function() {
      runs(function() {
        TestUtils.Simulate.keyDown(input, {key: 'Escape'});
        expect(typeAhead.state.inputValue).toEqual(typeAhead.props.value);
      });
    });
  });
});
