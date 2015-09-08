jest.dontMock('es6-promise');
require('es6-promise').polyfill();

jest.dontMock('../TypeAhead');
jest.dontMock('components/util/FieldUtil');

function getItems(value) {
  return new Promise((resolve, reject) => {
    resolve([value + '1', value + '2']);
  });
}

describe('TypeAhead', function() {

  var React, TestUtils;
  var TypeAhead, FieldUtil;

  var typeAhead;
  var input;
  var getItemsSpy;

  beforeEach(function () {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    TypeAhead = require('../TypeAhead.jsx');
    FieldUtil = require('components/util/FieldUtil');

    getItemsSpy = jest.genMockFunction().mockImplementation(getItems);

    typeAhead = TestUtils.renderIntoDocument(
      <TypeAhead name='name' value='foo' getItems={getItemsSpy} debounceSearch={false}/>
    );
    input = typeAhead.refs.input;
  });

  it('renders initial state', function() {
    expect(input.value).toEqual('foo');
    expect(input.name).toEqual('name');

    //closed
    expect(TestUtils.scryRenderedDOMComponentsWithClass(typeAhead, 'open').length).toEqual(0);
  });

  it('sets isLoading on search', function() {
    expect(typeAhead.state.isLoading).toEqual(false);
    TestUtils.Simulate.change(input, {target: {value: 'bar'}});
    expect(typeAhead.state.isLoading).toEqual(true);
  });

  describe('open state', function() {
    beforeEach(function () {
      runs(function() {
        TestUtils.Simulate.change(input, {target: {value: 'bar'}});
      });

      waitsFor(function() {
        return typeAhead.state.isLoading === false;
      }, 'Should finish loading', 100);
    });

    it('opens and searches on typing', () => {
      runs(function() {
        //open
        expect(TestUtils.scryRenderedDOMComponentsWithClass(typeAhead, 'open').length).toEqual(1);
        expect(input.value).toEqual('bar');
        expect(getItemsSpy.mock.calls[0]).toEqual(['bar']);

        var liEls = TestUtils.scryRenderedDOMComponentsWithTag(typeAhead, 'li');
        expect(liEls.length).toEqual(2);
        expect(liEls[0].textContent).toEqual('bar1');
      })
    });

    it('renders item data', () => {
      runs(() => {
        var liEls = TestUtils.scryRenderedDOMComponentsWithTag(typeAhead, 'li');
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
      })
    });

    it('enter key commits selected item', function() {
      runs(function() {
        spyOn(typeAhead, 'commit');

        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
        expect(typeAhead.commit).toHaveBeenCalledWith('bar1');
      })
    });

    it('escape key reverts to original value', function() {
      runs(function() {
        TestUtils.Simulate.keyDown(input, {key: 'Escape'});
        expect(typeAhead.state.inputValue).toEqual(typeAhead.props.value);
      })
    });
  });
});
