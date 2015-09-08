jest.dontMock('../TextField');
jest.dontMock('../util/FieldUtil');
jest.dontMock('form-data-to-object');

describe('TextField', function() {

  var React, TestUtils, onFormChangeSpy;
  var TextField;

  var textField, input;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    TextField = require('../TextField.jsx');

    onFormChangeSpy = jest.genMockFunction();
    textField = TestUtils.renderIntoDocument(
      <TextField name='name' value='val'
                className='class'
                onFormChange={onFormChangeSpy}/>
    );
    input = textField.refs.input;
  });

  it('renders props', () => {
    expect(input.name).toEqual('name');
    expect(input.className.split(' ')[1]).toEqual('class');
    expect(input.value).toEqual('val');
  });

  it('triggers onFormChange', () => {
    TestUtils.Simulate.change(input, {target: {value: 'foo'}});
    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'foo'}]);
  });
});
