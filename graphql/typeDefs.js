const { gql } = require("apollo-server");

/* type definition ! 
graphQL의 타입들을 정해주는듯. 모델의 스키마 느낌인가?
설명 필요 
*/
module.exports = gql`
  # saying what type they will return !
  type Post {
    # ! : ! needs at least one element.
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    # ? : !를 붙였을 때 non nullable에다 null을 넣지 말랜다. 그래서 일단 뺌.
    username: String!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  type User {
    id: ID!
    email: String!
    #   token ! : real authentification
    token: String!
    username: String!
    createdAt: String!
  }
  #   ? : input
  #   ? : 이 type 정의들을 어디서 어떻게 알아본다는거야? mongoDB에서 정의되어야 하는거 아니냐고.
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  #   ? : Query가 정확히 무슨 의미야?
  #  ! : 대상에 대해 싹 다 가져올거면 Query, 선택해서 가져올거면 Mutation.
  type Query {
    # get all posts
    getPosts: [Post]
    # get a post
    getPost(postId: ID!): Post
  }
  #   ? : Mutation이 뭐야. register과 registerInpuit은 또 뭐고.
  type Mutation {
    #   giving input to our resolver
    # ! : 이 type 정의에 따르지 않으면 쓸데가 없다. 프론트에서 query문 던질 때 알아둬야 함.
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, body: String!): Post!
    # 만약 계정 자체를 삭제하면 모든 코멘트와 포스트가 사라진다. 그러니 아이디를 확인해야할 듯?
    deleteComment(postId: ID!, commentId: ID!): Post!
    # 얘는 토글처럼 기능할 것. 켰다가 껐다가.
    likePost(postId: ID!): Post!
  }
  # to whom subscribed, new post will brought to him or her
  type Subscription {
    newPost: Post!
  }
`;
