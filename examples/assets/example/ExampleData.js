module.exports = {
  POST_DATA: {
    href: '/posts/1',
    id: 1,
    body: 'my body'
  },

  POST_DATA_WITH_EMPTY_COMMENTS: {
    href: '/posts/1',
    id: 1,
    body: 'my body',
    comments: []
  },

  POSTS: [{
    href: '/posts/1',
    id: 1,
    body: 'my body'
  }, {
    href: '/posts/2',
    id: 2,
    body: 'my body2'
  }, {
    href: '/posts/3',
    id: 3,
    body: 'my body3'
  }],

  POST_DATA_WITH_RELATED: {
    href: '/posts/1',
    id: 1,
    body: 'my body',
    author: {
      href: '/users/7',
      id: 7,
      name: 'bob',
      company: {
        name: 'Twitter'
      }
    },
    comments: [{
      href: '/comments/1',
      id: 5,
      body: 'my comment',
      user: {
        href: '/users/1',
        id: 1,
        username: 'user1'
      }
    }, {
      href: '/comments/6',
      id: 6,
      body: 'my comment2',
      user: {
        href: '/users/2',
        id: 2,
        username: 'user2'
      }
    }]
  },

  POST_DATA_WITH_RELATED_HREFS: {
    href: '/posts/1',
    id: 1,
    body: 'my body',
    author: {
      href: '/users/7'
    },
    comments: {
      href: '/comments'
    }
  },

  POST_DATA_WITH_COMMENTS_WITH_ATTRIBTES: {
    href: '/posts/1',
    id: 1,
    body: 'my body',
    comments: {
      href: '/comments',
      models: [{
        href: '/comments/5',
        id: 5,
        body: 'my comment',
        user: {
          href: '/users/1',
          username: 'user1'
        }
      }, {
        href: '/comments/6',
        id: 6,
        body: 'my comment2',
        user: {
          href: '/users/2',
          username: 'user2'
        }
      }]
    }
  },

  POSTS_WITH_COMMENTS: [{
    href: '/posts/1',
    id: 1,
    body: 'my body',
    comments: [{
      href: '/comments/5',
      id: 5,
      body: 'my comment',
      user: {
        href: '/users/1',
        username: 'user1'
      }
    }],
  }, {
    href: '/posts/2',
    id: 2,
    body: 'my body2',
    comments: [{
      href: '/comments/6',
      id: 6,
      body: 'my comment2',
      user: {
        href: '/users/2',
        username: 'user2'
      }
    }]
  }],

  POST_WITH_VIEW_STATE: {
    href: '/posts/1',
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
    href: '/posts/1',
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
    href: '/users/1',
    name: 'user1'
  }, {
    href: '/users/2',
    name: 'user2'
  }, {
    href: '/users/3',
    name: 'user3'
  }]
};