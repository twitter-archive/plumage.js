define([
  './PlumageRoot',
  './App',
  './collection/ActivityCollection',
  './collection/BufferedCollection',
  './collection/Collection',
  './collection/CommentCollection',
  './collection/DataCollection',
  './collection/Selection',
  './collection/GridSelection',
  './collection/UserCollection',
  './controller/BaseController',
  './controller/ModelController',
  './model/Activity',
  './model/Model',
  './model/Comment',
  './model/Data',
  './model/SearchResults',
  './model/User',
  './RequestManager',
  './Router',
  './slickgrid-all',
  './util/ArrayUtil',
  './util/D3Util',
  './util/DateTimeUtil',
  './util/Logger',
  './util/ModelUtil',
  './view/View',
  './view/CollectionView',
  './view/comment/CommentForm',
  './view/comment/CommentsSection',
  './view/comment/CommentView',
  './view/comment/ExpandableComments',
  './view/ContainerView',
  './view/controller/IndexView',
  './view/form/fields/ButtonGroupSelect',
  './view/form/fields/Calendar',
  './view/form/fields/CategorySelect',
  './view/form/fields/Checkbox',
  './view/form/fields/DateField',
  './view/form/fields/DateRangeField',
  './view/form/fields/DropdownMultiSelect',
  './view/form/fields/DropdownSelect',
  './view/form/fields/DurationField',
  './view/form/fields/Field',
  './view/form/fields/FieldWithPicker',
  './view/form/fields/FilterButtonGroup',
  './view/form/fields/FilterCheckbox',
  './view/form/fields/FilterTypeAhead',
  './view/form/fields/HourSelect',
  './view/form/fields/InPlaceTextField',
  './view/form/fields/MultiSelect',
  './view/form/fields/Radio',
  './view/form/fields/RadioButtonGroup',
  './view/form/fields/SearchField',
  './view/form/fields/Select',
  './view/form/fields/TextArea',
  './view/form/fields/TypeAhead',
  './view/form/fields/picker/DateRangePicker',
  './view/form/fields/picker/Picker',
  //'./view/form/FileDropZone',
  './view/form/Form',
  './view/form/SelectField',
  './view/grid/FilterView',
  './view/grid/Formatters',
  './view/grid/GridView',
  './view/grid/GridData',
  './view/grid/Pager',
  './view/ListAndDetailView',
  './view/ListItemView',
  './view/ListView',
  './view/menu/DropdownMenu',
  './view/ConfirmationDialog',
  './view/DisplayField',
  './view/MessageView',
  './view/ModalDialog',
  './view/ModelView',
  './view/NavView',
  './view/Popover',
  './view/ReactView',
  './view/TabView'
],
function(Plumage) {
  Plumage.components.ModelProvider = require('./components/ModelProvider');
  Plumage.components.NavBar = require('./components/NavBar');
  Plumage.components.Form = require('./components/Form');
  Plumage.components.util.FormUtil = require('./components/util/FormUtil');
  Plumage.components.FormGroup = require('./components/FormGroup');
  Plumage.components.Checkbox = require('./components/Checkbox');
  Plumage.components.DurationField = require('./components/DurationField');
  Plumage.components.TextArea = require('./components/TextArea');
  Plumage.components.TextField = require('./components/TextField');
  Plumage.components.SearchField = require('./components/SearchField');
  Plumage.components.TypeAhead = require('./components/TypeAhead');
  Plumage.components.TypeAheadResults = require('./components/TypeAheadResults');
  Plumage.components.InplaceTextField = require('./components/InplaceTextField');
  Plumage.components.DateField = require('./components/DateField');
  Plumage.components.DateRangeField = require('./components/DateRangeField');
  Plumage.components.Select = require('./components/Select');
  Plumage.components.CategorySelect = require('./components/CategorySelect');
  Plumage.components.ButtonGroupSelect = require('./components/ButtonGroupSelect');
  Plumage.components.DropdownSelect = require('./components/DropdownSelect');
  Plumage.components.DropdownMultiselect = require('./components/DropdownMultiselect');
  Plumage.components.FilterBar = require('./components/FilterBar');
  Plumage.components.tree.Tree = require('./components/tree/Tree');
  Plumage.components.LoadingError = require('./components/LoadingError');

  return Plumage;
});
