jest.dontMock('../Checkbox');
jest.dontMock('../util/FieldUtil');
jest.dontMock('form-data-to-object');

describe('Checkbox', function() {

  var React, TestUtils, onFormChangeSpy;
  var Checkbox;
  var renderComponent;

  var checkbox, input;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    Checkbox = require('../Checkbox.jsx');
    var _ = require('underscore');

    onFormChangeSpy = jest.genMockFunction();

    renderComponent = function(props) {
      props = _.extend({}, {
        name: 'name',
        className: 'class',
        label: 'label',
        value: 1,
        checkedValue: 1,
        uncheckedValue: 2,
        onFormChange: onFormChangeSpy
      }, props);
      return TestUtils.renderIntoDocument(<Checkbox {...props}/>);
    };
  });

  it('renders for props', () => {
    let checkbox = renderComponent();
    let input = checkbox.refs.input;

    expect(input.name).toEqual('name');
    expect(input.className).toEqual('class');
    expect(input.checked).toEqual(true);

    let label = TestUtils.findRenderedDOMComponentWithTag(checkbox, 'label');
    expect(label.textContent.replace(/ /g, '')).toEqual('label');
    expect(checkbox.refs.input.disabled).toEqual(false);
  });

  it('renders disabled', () => {
    let checkbox = renderComponent({disabled: true});
    expect(checkbox.refs.input.disabled).toEqual(true);
  });

  it('sets the the correct values', () => {
    let checkbox = renderComponent();
    let input = checkbox.refs.input;

    TestUtils.Simulate.change(input, {target: {checked: false}});
    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 2}]);

    //don't trigger if value the same
    TestUtils.Simulate.change(input, {target: {checked: true}});
    expect(onFormChangeSpy.mock.calls.length).toEqual(1);

    //unchecked input
    checkbox = TestUtils.renderIntoDocument(<Checkbox value={2} {...checkbox.props}/>);
    TestUtils.Simulate.change(input, {target: {checked: false}});
    expect(onFormChangeSpy.mock.calls[1]).toEqual(['update', {name: 2}]);
  });
});
