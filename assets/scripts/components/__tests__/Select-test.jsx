jest.dontMock('../Select');
jest.dontMock('../util/FieldUtil');
jest.dontMock('form-data-to-object');

describe('Select', function() {

  var React, TestUtils, onFormChangeSpy;
  var Select;
  var renderComponent, defaultOptions;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    Select = require('../Select.jsx');
    var _ = require('underscore');

    onFormChangeSpy = jest.genMockFunction();

    defaultOptions = [
      {value: 'foo', label: 'Foo', className: 'foo'},
      {value: 'bar', label: 'Bar', className: 'bar'}
    ];

    renderComponent = function(props) {
      props = _.extend({}, {
        name: 'name',
        placeholder: 'Placeholder',
        placeholderValue: '',
        className: 'class',
        options: defaultOptions,
        onFormChange: onFormChangeSpy
      }, props);
      return TestUtils.renderIntoDocument(<Select {...props}/>);
    };
  });

  it('renders props', () => {
    let select = renderComponent();
    let input = select.refs.input;
    let optionEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'option');

    expect(input.name).toEqual('name');
    expect(input.className.split(' ')[1]).toEqual('class');

    expect(optionEls.length).toEqual(3);
    expect(optionEls[0].value).toEqual('');
    expect(optionEls[0].textContent).toEqual('Placeholder');

    expect(optionEls[1].textContent).toEqual(defaultOptions[0].label);
    expect(optionEls[1].className).toEqual(defaultOptions[0].className);

    expect(select.refs.input.disabled).toEqual(false);
  });

  it('renders disabled', () => {
    let select = renderComponent({disabled: true});
    expect(select.refs.input.disabled).toEqual(true);
  });

  it('triggers onFormChange', () => {
    let select = renderComponent();
    let input = select.refs.input;

    TestUtils.Simulate.change(input, {target: {value: 'bar'}});
    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'bar'}]);
  });
});
