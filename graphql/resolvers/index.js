const postResolver = require("./postResolver");
const userResolver = require("./userResolver");
const commentsResolver = require("./commentsResolver");

// now we combine two resolvers in this file.
module.exports = {
  /* each  time any mutation, Query, Subscription that returns a Post, 
  it will go through this post modifier.
  설명 필요 */
  Post: {
    // !: parent comes from getPost now.
    /*console.log(parent);
    {
        _id: 60166c04acc97747e05e5f90,
        body: 'creating post ??',
        user: 60165a2e9957681dbcdda220,
        username: 'koala',
        createdAt: '2021-01-31T08:36:20.727Z',
        comments: [
          {
            _id: 6017533f9cab564594b81510,
            body: "I don't understand this!!!",
            username: 'lion',
            createdAt: '2021-02-01T01:02:55.867Z'
          },
          {
            _id: 60174b78540682314c71ea9a,
            body: 'new comment on koala!',
            username: 'lion',
            createdAt: '2021-02-01T00:29:44.086Z'
          }
        ],
        likes: [],
        __v: 7
    }
    */
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Query: {
    ...postResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...postResolver.Mutation,
    ...commentsResolver.Mutation,
  },
  Subscription: {
    ...postResolver.Subscription,
  },
};
