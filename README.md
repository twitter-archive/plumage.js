### Plumage.js [![build status](https://secure.travis-ci.org/twitter/plumage.js.png?branch=master)](http://travis-ci.org/twitter/plumage.js)
JS UI framework for complex UIs.

### Installation

Currently need to bower install from local repo

    git clone https://github.com/twitter/plumage.js.git

    cd [my-js-project]
    bower install plumagejs=../plumage.js

Someday it might be possible to `bower install plumagejs`, but not yet.

### Getting Started

Add script tags for require.js, config.js (config for require.js) to your index.html

    <script type="text/javascript" src="/bower_components/plumagejs/assets/scripts/vendor/require.js"></script>
    <script type="text/javascript" src="/bower_components/plumagejs/assets/scripts/config.js"></script>
    <!-- include your own require.js config here -->

In your js files, require plumage, and access plumage classes from the [Plumage](Plumage.html) object.

    define(['jquery', 'underscore', 'plumage'],
    function($, _, Plumage) {
      return Plumage.model.Model.extend({
        urlRoot: '/mymodel'
      });
    });

### Hello Plumage

To get running, we'll need an [App](Plumage.App.html), a [Router](Plumage.Router.html) and a [Controller](Plumage.controller.BaseController.html).

**controller/MyController.js**

    define(['jquery', 'underscore', 'plumage'],
    function($, _, Plumage, ) {
      return Plumage.controller.BaseController.extend({
        sayHello: function() {
          alert('Hello Plumage!');
        }
      });
    });

**MyRouter.js**

    define(['jquery', 'underscore', 'plumage'],
    function($, _, Plumage, ) {
      return Plumage.Router.extend({
        controllerRoutes: {
          '': {controller: 'MyController', method: 'sayHello'},
        }
      });
    });

**application.js**

    define(['jquery', 'underscore', 'plumage', 'MyRouter', 'controller/MyController'],
    function($, _, Plumage, MyRouter) {
      myApp = new Plumage.App({
        initCSRFToken: true,
        controllers: [
          'MyController'
        ]
      });
      window.router = new MyRouter({app: myApp});
      return myApp;
    });

Then require your application in your index.html and you're good to go.

    <script type="text/javascript">require(['application']);</script>

Load the page and you should see the 'Hello Plumage!' alert.

### Next Steps

Next you'll probably want some [Models](Plumage.model.Model.html), [Collections](Plumage.collection.Collection.html) and
[Views](Plumage.view.ModelView.html). A good place to start is the source code of the [Countries example](../examples/countries).





