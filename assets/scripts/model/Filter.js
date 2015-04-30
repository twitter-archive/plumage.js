define(['jquery', 'underscore', 'backbone', 'PlumageRoot', 'model/Model'],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.Filter = Model.extend(
  /** @lends Plumage.model.Filter.prototype */
  {

    idAttribute: 'id',

    /**
     * Model for a Filter on a [Collection]{@link Plumage.collection.Collection}.
     *
     * Attributes are:
     *  - key: The key of the attribute being filtered on.
     *  - value: The filter value
     *  - comparison: A string or function that compares the model value with the filter value.
     *
     * eg model's 'name'[key] equals[comaprison] 'foo'[value]
     *
     * For client side filtering, also contains a [compare]{@link Plumage.model.Filter} predicate for testing if Models pass the specified filter.
     *
     * @constructs
     * @extends Plumage.model.Model
     */
    initialize: function() {
      //filters exist only on client, so give them all unique ids
      this.set('id', _.uniqueId('filter'));
    },

    /** Map of built in comparison names to comparison functions */
    comparisons: {
      equals: function(filterValue, value, key) {
        return String(filterValue).toLowerCase() === String(value).toLowerCase();
      },
      contains: function(filterValue, value, key) {
        return String(value).toLowerCase().indexOf(String(filterValue).toLowerCase()) !== -1;
      },
      startswith: function(filterValue, value, key) {
        return String(value).indexOf(String(filterValue)) === 0;
      },
      endswith: function(filterValue, value, key) {
        return String(value).toLowerCase().indexOf(String(filterValue)).toLowerCase() === String(value).length;
      }
    },

    /**
     * Predicate testing whether the given model passes this filter
     * @param {Plumage.model.Model} model Model to test
     */
    compare: function(model) {
      var key = this.get('key'), value;
      if (model.get) {
        value = model.get(key);
      } else {
        value = model[key];
      }
      var filterValue = this.get('value');
      if (filterValue === undefined) {
        return true;
      }
      var comparison = this.get('comparison');
      if (typeof(comparison) === 'string') {
        comparison = this.comparisons[comparison];
        if (comparison) {
          return comparison(filterValue, value, key);
        }
        return true;
      }
      return comparison(filterValue, value, key);
    },

    toJSON: function(){
      //don't include arbitrary id in json
      var json = Model.prototype.toJSON.apply(this, arguments);
      delete json.id;
      return json;
    }
  });
});