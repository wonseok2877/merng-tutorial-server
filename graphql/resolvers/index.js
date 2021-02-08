const postResolver = require("./postResolver");
const userResolver = require("./userResolver");
const commentsResolver = require("./commentsResolver");

// now we combine two resolvers in this file.
module.exports = {
  /* modifier !
  typeDef에서 정의된 collection의 field를 Query든 Mutation이든 한 번이라도 건들면,
  그에 대한 값을 modifier에서 정해줄 수 있다.
  each  time any mutation, Query, Subscription that returns a Post, 
  it will go through this post modifier.
  그래서 likeCount와 commentCount는 따로 resolver에서 정의하지 않아도 값을 구할 수 있는 것.*/
  Post: {
    likeCount: (parent) => {
      /* parent !
      프론트쪽에서 뭘 요청하든 parent는 해당 parent, 여기선 포스트의 
      모오오오든 정보를 다 가져오네. */
      return parent.likes.length;
    },
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
