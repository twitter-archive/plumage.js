/*jshint -W061 */
/* global $, _ */
var Plumage = require('plumage');
var hljs = require('kitchen_sink/highlight');
var Environment = require('test/environment');

module.exports = Plumage.view.ModelView.extend({
  className: 'example-view',

  template: '<div class="the-example"></div>',

  events: {
    'click .example-result a': 'onExampleResultClick'
  },

  updateOnChange: false,

  initialize: function() {
    this.testEnv = new Environment();
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
  },

  onRender: function() {
    Plumage.view.ModelView.prototype.onRender.apply(this, arguments);

    this.testEnv.setup();
    this.$('.example-code').each(function(i, el) {this.evaluateExampleCode(el);}.bind(this));
    this.testEnv.teardown();
  },

  evaluateExampleCode: function(el) {
    var code = $('code', el), result = '', f;
    if (code) {
      f = eval('(function (Plumage, log, testEnv) {' + code.text() + '})');
      var exampleConsole = {log: function(text) {
        result += text + '\n';
      }};

      this.testEnv.console = exampleConsole;
      f(Plumage, exampleConsole.log, this.testEnv);
    }
    $(el).append($('<div class="example-result"><a>Result</a><pre><code>'+ result +'</code></pre></div>'));
    hljs.highlightBlock(code[0], ['javascript']);
  },

  onExampleResultClick: function(event) {
    var parent = $(event.target).parent('.example-result');
    parent.toggleClass('expanded');

    $('pre', parent).slideToggle({duration: 200});
  }
});