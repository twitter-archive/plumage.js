jest.dontMock('../CategorySelect');
jest.dontMock('../util/FieldUtil');

describe('CategorySelect', function() {
  let React;
  let TestUtils;
  let onFormChangeSpy;
  let CategorySelect;
  let renderComponent;

  let defaultOptions;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    CategorySelect = require('../CategorySelect.jsx');
    let _ = require('underscore');

    onFormChangeSpy = jest.genMockFunction();

    defaultOptions = [
      {value: 'foo', label: 'Foo', className: 'foo'},
      {value: 'bar', label: 'Bar', className: 'bar'},
      {value: 'disabled', label: 'Disabled', className: 'wargarbl', disabled: true}
    ];

    renderComponent = function(props) {
      let theProps = _.extend({}, {
        name: 'name',
        placeholder: 'Placeholder',
        placeholderValue: '',
        className: 'class',
        options: defaultOptions,
        onFormChange: onFormChangeSpy
      }, props);
      return TestUtils.renderIntoDocument(<CategorySelect {...theProps}/>);
    };
  });

  it('renders option classes', () => {
    let select = renderComponent();
    let liEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'li');
    expect(liEls[0].className).toEqual('placeholder active');
    expect(liEls[1].className).toEqual(defaultOptions[0].className);
    expect(liEls[3].className).toEqual(defaultOptions[2].className + ' disabled');
  });

  it('selects on click', () => {
    let select = renderComponent();
    let aEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'a');
    TestUtils.Simulate.click(aEls[1]);

    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'foo'}]);
  });
});
