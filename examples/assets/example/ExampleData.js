define([],function() {
  return {
    POST_DATA: {
      id: 1,
      body: 'my body'
    },

    POST_DATA_WITH_EMPTY_COMMENTS: {
      id: 1,
      body: 'my body',
      comments: []
    },

    POSTS: [{
      id: 1,
      body: 'my body'
    }, {
      id: 2,
      body: 'my body2'
    }, {
      id: 3,
      body: 'my body3'
    }],

    POST_DATA_WITH_RELATED: {
      id: 1,
      body: 'my body',
      author: {
        id: 7,
        name: 'bob',
        company: {
          id: 1,
          name: 'Twitter'
        }
      },
      comments: [{
        id: 5,
        body: 'my comment',
        user: {
          username: 'user1'
        }
      }, {
        id: 6,
        body: 'my comment2',
        user: {
          username: 'user2'
        }
      }]
    },

    POST_DATA_WITH_RELATED_HREFS: {
      id: 1,
      body: 'my body',
      author: {
        href: '/author_href/7'
      },
      comments: {
        href: '/comments_href'
      }
    },

    POST_DATA_WITH_COMMENTS_WITH_ATTRIBTES: {
      id: 1,
      body: 'my body',
      comments: {
        href: '/comments_href',
        models: [{
          id: 5,
          body: 'my comment',
          user: {
            username: 'user1'
          }
        }, {
          id: 6,
          body: 'my comment2',
          user: {
            username: 'user2'
          }
        }]
      }
    },

    POSTS_WITH_COMMENTS: [{
      id: 1,
      body: 'my body',
      comments: [{
        id: 5,
        body: 'my comment',
        user: {
          username: 'user1'
        }
      }],
    }, {
      id: 2,
      body: 'my body2',
      comments: [{
        id: 6,
        body: 'my comment2',
        user: {
          username: 'user1'
        }
      }]
    }],

    POST_WITH_VIEW_STATE: {
      id: 1,
      body: 'my body',
      tab: 'detail'
    },

    CATEGORIES: [{
      name: 'activities',
      label: 'Activities'
    }, {
      name: 'life',
      label: 'Life'
    }, {
      name: 'work',
      label: 'Work'
    }],

    POST_WITH_CATEGORIES: {
      id: 1,
      body: 'my body',
      categories: [{
        name: 'activities',
        label: 'Activities'
      }, {
        name: 'life',
        label: 'Life'
      }, {
        name: 'work',
        label: 'Work'
      }]
    },

    USERS: [{
      name: 'user1'
    }, {
      name: 'user2'
    }, {
      name: 'user3'
    }]
  };

});