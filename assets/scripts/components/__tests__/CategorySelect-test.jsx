jest.dontMock('../CategorySelect');
jest.dontMock('../util/FieldUtil');

describe('CategorySelect', function() {

  var React, TestUtils, onFormChangeSpy;
  var CategorySelect;
  var renderComponent;

  var options;

  beforeEach(() => {
    React = require('react');
    TestUtils = require('react-addons-test-utils');
    CategorySelect = require('../CategorySelect.jsx');
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
      return TestUtils.renderIntoDocument(<CategorySelect {...props}/>);
    };

  });

  it('selects on click', () => {
    var select = renderComponent();
    var aEls = TestUtils.scryRenderedDOMComponentsWithTag(select, 'a');
    TestUtils.Simulate.click(aEls[1]);

    expect(onFormChangeSpy.mock.calls[0]).toEqual(['update', {name: 'foo'}]);
  });
});
