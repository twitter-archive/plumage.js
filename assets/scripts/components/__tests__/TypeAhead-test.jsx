/* global runs, waitsFor, spyOn */
import _ from 'underscore';

jest.dontMock('es6-promise');
require('es6-promise').polyfill();

jest.dontMock('../TypeAhead');

function getResults(value) {
  return [
    {label: value + '1', value: value + '1'},
    {label: value + '2', value: value + '2'}
  ];
}

function getResultsAsync(value) {
  return new Promise((resolve) => {
    resolve([
      {label: value + '1', value: value + '1'},
      {label: value + '2', value: value + '2'}
    ]);
  });
}

describe('TypeAhead', function() {
  let React;
  let TestUtils;
  let TypeAhead;
  let TypeAheadResults;
  let renderComponent;

  let getResultsSpy;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    TypeAhead = require('../TypeAhead.jsx');
    TypeAheadResults = require('../TypeAheadResults.jsx');

    getResultsSpy = jest.genMockFunction().mockImplementation(getResultsAsync);

    renderComponent = (props) => {
      let theProps = _.extend({}, {
        name: 'name',
        value: 'foo',
        debounceSearch: false,
        getResults: getResultsSpy
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
        expect(getResultsSpy.mock.calls[0]).toEqual(['bar']);

        let resultsSection = TestUtils.findRenderedComponentWithType(typeAhead, TypeAheadResults);
        expect(resultsSection.props.results.length).toEqual(2);
        expect(resultsSection.props.results[0].value).toEqual('bar1');
      });
    });

    it('can navigate items with arrow keys', function() {
      runs(function() {
        expect(typeAhead.state.selectedIndex).toEqual(0);

        TestUtils.Simulate.keyDown(input, {key: 'ArrowUp'}); // wraps around
        expect(typeAhead.state.selectedIndex).toEqual(1);

        TestUtils.Simulate.keyDown(input, {key: 'ArrowDown'});
        expect(typeAhead.state.selectedIndex).toEqual(0);

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

  describe('getResultAt', function() {
    it('gets result without sections', function() {
      let typeAhead = renderComponent({getResults: getResults});

      typeAhead.updateSearch('value');
      let result = typeAhead.getResultAt(0);
      expect(result.value).toEqual('value1');
    });
  });

  describe('result sections', function() {
    it('renders multiple result sections', function() {
      let typeAhead = renderComponent({
        resultSections: [{key: 'foo', title: 'Foos'}, {key: 'bar', title: 'Bars'}],
        getResults: function() {
          return {
            foo: [{value: 'foo1', label: 'foo1'}],
            bar: [{value: 'bar1', label: 'bar1'}]
          };
        }
      });
      typeAhead.updateSearch('query');

      let resultsSections = TestUtils.scryRenderedComponentsWithType(typeAhead, TypeAheadResults);

      expect(resultsSections.length).toEqual(2);
      expect(resultsSections[0].props.title).toEqual('Foos');
      expect(resultsSections[0].props.startIndex).toEqual(0);
      expect(resultsSections[0].props.results[0].value).toEqual('foo1');

      expect(resultsSections[1].props.title).toEqual('Bars');
      expect(resultsSections[1].props.startIndex).toEqual(1);
      expect(resultsSections[1].props.results[0].value).toEqual('bar1');
    });
  });
});
