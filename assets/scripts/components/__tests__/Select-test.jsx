jest.dontMock('../Select');
jest.dontMock('../util/FieldUtil');
jest.dontMock('form-data-to-object');

describe('Select', function() {

  var React, TestUtils, onFormChangeSpy;
  var Select;

  var select, input, options, optionEls;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    Select = require('../Select.jsx');

    onFormChangeSpy = jest.genMockFunction();

    options = [
      {value: 'foo', label: 'Foo', className: 'foo'},
      {value: 'bar', label: 'Bar', className: 'bar'}
    ];
    select = TestUtils.renderIntoDocument(
      <Select name='name'
              placeholder='Placeholder'
              placeholderValue='placeholder'
              value='placeholder'
              className='class'
              options={options}
              onFormChange={onFormChangeSpy}/>
    );
    input = select.refs.input;
    optionEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'option');
  });

  it('renders props', () => {
    expect(input.name).toEqual('name');
    expect(input.className.split(' ')[1]).toEqual('class');

    expect(optionEls.length).toEqual(3);
    expect(optionEls[0].value).toEqual('placeholder');
    expect(optionEls[0].textContent).toEqual('Placeholder');

    expect(optionEls[1].textContent).toEqual(options[0].label);
    expect(optionEls[1].className).toEqual(options[0].className);
  });

  it('triggers onFormChange', () => {
    TestUtils.Simulate.change(input, {target: {value: 'bar'}});
    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'bar'}]);
  });
});
