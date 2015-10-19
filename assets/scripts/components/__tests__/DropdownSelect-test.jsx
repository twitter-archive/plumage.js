import _ from 'underscore';

jest.dontMock('../DropdownSelect');
jest.dontMock('../util/FieldUtil');

describe('DropdownSelect', function() {
  let React;
  let TestUtils;
  let onFormChangeSpy;
  let DropdownSelect;
  let renderComponent;

  let options;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    DropdownSelect = require('../DropdownSelect.jsx');

    onFormChangeSpy = jest.genMockFunction();

    options = [
      {value: 'foo', label: 'Foo', className: 'foo'},
      {value: 'bar', label: 'Bar', className: 'bar'}
    ];

    renderComponent = function(props) {
      let theProps = _.extend({}, {
        name: 'name',
        placeholder: 'Placeholder',
        placeholderValue: '',
        className: 'class',
        options: options,
        onFormChange: onFormChangeSpy
      }, props);
      return TestUtils.renderIntoDocument(<DropdownSelect {...theProps}/>);
    };
  });

  it('renders props', () => {
    let select = renderComponent();
    let el = TestUtils.findRenderedDOMComponentWithClass(select, 'dropdown-select');

    expect(select.refs.input.name).toEqual('name');

    let classNames = el.className.split(' ');
    expect(classNames[classNames.length - 1]).toEqual('class');

    let button = TestUtils.findRenderedDOMComponentWithTag(select, 'button');
    expect(button.textContent.replace(/ /g, '')).toEqual('Placeholder');

    let liEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'li');
    expect(liEls.length).toEqual(2);
    expect(liEls[0].textContent).toEqual(options[0].label);

    let aEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'a');
    expect(aEls.length).toEqual(2);
    expect(aEls[0].getAttribute('data-value')).toEqual(options[0].value);
  });

  it('selects on click', () => {
    let select = renderComponent();
    let aEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'a');
    TestUtils.Simulate.click(aEls[0]);

    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'foo'}]);
  });

  // State not changing on click :S
  //
  // it('opens on expand click', () => {
  //   let select = renderComponent();
  //   let button = TestUtils.findRenderedDOMComponentWithTag(select, 'button');
  //   TestUtils.Simulate.click(button);
  //
  //   let selectEl = TestUtils.findRenderedDOMComponentWithClass(select, 'dropdown-select');
  //
  //   expect(selectEl.getAttribute('class')).toInclude(true);
  // });
});
