jest.dontMock('../DropdownSelect');
jest.dontMock('../util/FieldUtil');

describe('DropdownSelect', function() {

  var React, TestUtils, onFormChangeSpy;
  var DropdownSelect;
  var renderComponent;

  var options;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    DropdownSelect = require('../DropdownSelect.jsx');
    var _ = require('underscore');

    onFormChangeSpy = jest.genMockFunction();

    options = [
      {value: 'foo', label: 'Foo', className: 'foo'},
      {value: 'bar', label: 'Bar', className: 'bar'}
    ];

    renderComponent = function(props) {
      props = _.extend({}, {
        name: 'name',
        placeholder: 'Placeholder',
        placeholderValue: '',
        className: 'class',
        options: options,
        onFormChange: onFormChangeSpy
      }, props);
      return TestUtils.renderIntoDocument(<DropdownSelect {...props}/>);
    };

  });

  it('renders props', () => {
    var select = renderComponent();
    var el = TestUtils.findRenderedDOMComponentWithClass(select, 'dropdown-select');

    expect(select.refs.input.name).toEqual('name');

    var classNames = el.className.split(' ');
    expect(classNames[classNames.length-1]).toEqual('class');

    var button = TestUtils.findRenderedDOMComponentWithTag(select, 'button');
    expect(button.textContent.replace(/ /g, '')).toEqual('Placeholder');

    var liEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'li');
    expect(liEls.length).toEqual(2);
    expect(liEls[0].textContent).toEqual(options[0].label);

    var aEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'a');
    expect(aEls.length).toEqual(2);
    expect(aEls[0].getAttribute('data-value')).toEqual(options[0].value);
  });

  it('selects on click', () => {
    var select = renderComponent();
    var aEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'a');
    TestUtils.Simulate.click(aEls[0]);

    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'foo'}]);
  });

  //it('opens on expand click', () => {
  //  var select = renderComponent();
  //  var button = TestUtils.findRenderedDOMComponentWithTag(select, 'button');
  //  TestUtils.Simulate.click(button);
  //
  //  expect(select.state.isExpanded).toEqual(true);
  //});
});
