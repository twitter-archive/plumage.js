jest.dontMock('../Checkbox');
jest.dontMock('../util/FieldUtil');
jest.dontMock('form-data-to-object');

describe('Checkbox', function() {

  var React, TestUtils, onFormChangeSpy;
  var Checkbox;

  var checkbox, input;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    Checkbox = require('../Checkbox.jsx');

    onFormChangeSpy = jest.genMockFunction();
    checkbox = TestUtils.renderIntoDocument(
      <Checkbox name='name'
                className='class'
                label='label'
                value={1}
                checkedValue={1}
                uncheckedValue={2}
                onFormChange={onFormChangeSpy}/>
    );
    input = checkbox.refs.input;
  });

  it('renders for props', () => {
    expect(input.name).toEqual('name');
    expect(input.className).toEqual('class');
    expect(input.checked).toEqual(true);

    let label = TestUtils.findRenderedDOMComponentWithTag(checkbox, 'label');
    expect(label.textContent.replace(/ /g, '')).toEqual('label');
  });

  it('sets the the correct values', () => {
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
