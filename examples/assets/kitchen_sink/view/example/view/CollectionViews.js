define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'example/model/Post',
  'example/collection/PostCollection',
  'text!kitchen_sink/view/example/view/templates/CollectionViews.html'
], function($, _, Backbone, Plumage, BaseExample, Post, PostCollection, template) {

  return BaseExample.extend({

    modelCls: PostCollection,

    template: template,

    POSTS_DATA: [{
      id: 1,
      title: 'my post 1',
      body: 'my body',
      author: {name: 'Alice'},
      comments: [{
        id: 5,
        body: 'my comment',
        user: {
          username: 'user1'
        }
      }],
    }, {
      id: 2,
      title: 'my post 2',
      body: 'my body2',
      author: {name: 'Bob'},
      comments: [{
        id: 6,
        body: 'my comment2',
        user: {
          username: 'user1'
        }
      }, {
        id: 7,
        body: 'another comment',
        user: {
          username: 'user3'
        }
      }]
    }],

    initialize:function(options) {
      options = options || {};

      this.events = _.extend({'click #add-post-btn': 'onAddPostClick'}, this.events);

      var CommentView = Plumage.view.ModelView.extend({
        template: 'Comment: {{body}} <div class="user" style="margin-left: 20px"></div',
        initialize: function(options) {
          this.subViews = [
            new Plumage.view.ModelView({
              relationship: 'user',
              selector: '.user',
              template: 'User: {{username}}'
            })
          ];
          Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
        }
      });

      this.subViews = [
        new Plumage.view.CollectionView({
          selector: '.collection-view',
          itemViewCls: Plumage.view.ModelView,
          itemOptions: {
            template: 'Post: {{title}}'
          },
          onModelAdd: function() {
            Plumage.view.CollectionView.prototype.onModelAdd.apply(this, arguments);
          }
        }),
        new Plumage.view.CollectionView({
          selector: '.advanced-collection-view',
          itemViewCls: Plumage.view.ModelView.extend({
            template: 'Post: {{title}} <div class="comments" style="margin-left: 20px"></div>',
            initialize: function(options) {
              options = options || {};
              this.subViews = [
                new Plumage.view.CollectionView({
                  selector: '.comments',
                  relationship: 'comments',
                  itemViewCls: CommentView
                })
              ];
              Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
            }
          }),
        })
      ];

      BaseExample.prototype.initialize.apply(this, arguments);

      this.setModel(new PostCollection(this.POSTS_DATA));
    },

    onAddPostClick: function() {
      var index = this.model.size() + 1;
      this.model.add(new Post({id: index, title: 'my post ' + index, body: 'my body ' + index}));
    }
  });
});