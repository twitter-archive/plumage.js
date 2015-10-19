import _ from 'underscore';

jest.dontMock('../TextField');
jest.dontMock('../util/FieldUtil');
jest.dontMock('form-data-to-object');

describe('TextField', function() {
  let React;
  let TestUtils;
  let onFormChangeSpy;
  let TextField;
  let renderComponent;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    TextField = require('../TextField.jsx');

    onFormChangeSpy = jest.genMockFunction();
    renderComponent = function(props) {
      let theProps = _.extend({}, {
        name: 'name',
        value: 'val',
        className: 'class',
        onFormChange: onFormChangeSpy
      }, props);
      return TestUtils.renderIntoDocument(<TextField {...theProps}/>);
    };
  });

  it('renders props', () => {
    let textField = renderComponent();
    let input = textField.refs.input;

    expect(input.name).toEqual('name');
    expect(input.className.split(' ')[1]).toEqual('class');
    expect(input.value).toEqual('val');
  });

  it('triggers onFormChange', () => {
    let textField = renderComponent();
    let input = textField.refs.input;

    TestUtils.Simulate.change(input, {target: {value: 'foo'}});
    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'foo'}]);
  });
});
