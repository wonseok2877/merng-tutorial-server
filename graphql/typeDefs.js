/* 2-0. REST API vs graphQL
graphQL은 REST API처럼 구체적인 end point가 나눠져 있지 않다. 단 하나의 endpoint.
대신, 우리는 Query type를 통해 우리 schemad의 entry point들을 정의한다 ! 다른 type definition과 같은 모양새임.
Query types안에는 client side에서 요청할 모든 Query문을 집어 넣는다.
Mutation과 Subscription도 마찬가지. */
const { gql } = require("apollo-server");

/* 2. type definition ! 
(graphQL schema definition language)
: collection of object types that contain fields. 
Each field has a type of its own. A field's type can be scalar 
(such as an Int or a String), or it can be another object type.
이 정의를 기반으로 Apollo server에서 schema를 보여주는 것 !
*/

/* 2-1. what is gql ? 
: tag template used in schema definition we are going to write. 
it's from apollo server package. 
*/
module.exports = gql`
  # 2-2. 그래서 얘가 하는게 뭔데 ?
  # : REST API의 endpoint 좆까. 이 field들 즉 각각의 entrypoint로 대체하겠다는 것 !
  # 그리고 그 field들이 어떻게 생겨야만 하는지, 그 type을 정의한다.
  # saying what type they will return !

  # 2-3. type이라는 키워드로 collection을 정의하기 시작한다.
  type Post {
    # 2-4. field : 여기서 id, body, createdAt, ...는 모두 field에 속한다.
    # field type : 그것들의 type은 field type이라고 부르며, int, string등 여러가지.
    id: ID!
    # ! : not nullable. ! needs at least one element.
    body: String!
    createdAt: String!
    username: String!
    # 2-5. 따로 정의해놓은 collection을 field type으로써 정의할 수도 잇당
    # even if this array is empty, it is fine. because there will be many lonely posts that has no comments and likes.
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  # ! : 실제 DB에는 username, email, createdAt, password밖에 없지만,
  # mongoose에선, id를 resolver에선 token을 만들기 때문에 여기서 정의해주는 것.
  type User {
    id: ID!
    email: String!
    #   token ! : real authentification
    token: String!
    username: String!
    createdAt: String!
  }
  #  input ?  : inpuit

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  # 2-6. Query와 Mutation
  # : Query는 REST API의 get방식에 해당한다. 정보를 읽기만 함.
  # Mutation은 REST API의 post, delete, update등의 방식에 해당. 정보를 건든다.
  type Query {
    # get all posts
    getPosts: [Post]
    # get a post
    getPost(postId: ID!): Post
  }
  #  2-7.이 type 정의들을 어디서 어떻게 알아본다는거야? mongoDB에서 정의되어야 하는거 아니냐고.
  # : resolver에서 알아보지 ~ MongoDB와 별개야.
  # ! : 한 마디로 프론트의 요청, 백엔드의 응답에 대한 약속이야.
  # 어차피 json data만 주고 받을거, req res 이지랄 하지말고
  # 컴팩트하게 나 무슨 data받겠다! 직설적으로 프론트엔드에서 말하란 말이야.
  type Mutation {
    #   giving input to our resolver
    # ! : 이 type 정의에 따르지 않으면 쓸데가 없다. 프론트에서 query문 던질 때 알아둬야 함.
    # input 정의 : 특정 data를 인자값으로 하는 mutation들. 이걸 올바르게 넣어줘야만 제대로 된 아웃풋 값이 나온다.
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
