const { ApolloServer, PubSub } = require("apollo-server");
// mongoose : interfacer of mongoDB we have
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { MONGODB } = require("./config");

// PubSub ? 설명 필요
const pubsub = new PubSub();

const PORT = process.env.port || 4001;

/* 1-0. graphQL 서버의 목적 ?
 : On the back-end side, our first goal is :
1-클라이언트 쪽으로부터 Query문을 받기 위해
2-그 Query문이 서버쪽의 graphQL Schema를 기준으로 유효한지 검샤
3-해당 Schema의 field를 서버쪽 Resolver의 return값으로 채워주기 위해 */

/* 1-1. how can I view data in Apollo server ?
: new ApolloServer ! npm package임.
it needs the typedef of GraphQL and the resolvers.*/
const server = new ApolloServer({
  /* 1-6. typeDefinition과 Resolver 불러오기!
  ApolloServer 함수에 필수적인 인자값으로 보인다.
  지웠을 때 ㅋㅋ Error: Apollo Server requires either 
  an existing schema, modules or typeDefs */
  typeDefs,
  resolvers,
  /* don't make a mistake adding this middleware for all express server itself.
  that allows even non protected routes.
  so we are gonna make context.*/
  /* 1-7. context 
  아폴로 서버로 오기 이전에 express로부터 온 요청들, request와 respond을 다 담는다.
  take the req.body to the context. 
  and access to the request in our context.
  한 마디로 프론트로부터의 요청을 인식한다 !
  설명 필요
  */
  context: ({ req }) => ({ req, pubsub }),
});

// error : ID cannot represent value: {_bsontype: \"ObjectID\" 해결 복붙 ..
ObjectId.prototype.valueOf = function () {
  return this.toString();
};

/* 1. connecting to mongoDB !
우선 mongoDB와의 연결은 서버에서 결정된다. mongoDB url을 갖고 있음.
? mongoDB의 DB는 일단 직접 만들어야 하는건가? Atlas 에서 ?
근데 니꼴라스는 Atlas나 compass 없이 그냥 만들던데.
설명 필요 */
// before connect(), we should set the connect in mongoDB Atlas.
try {
  mongoose
    /* 1-2. .connect  : mongoDB url에 연결한다.
  그 뒤엔 연결에 대한 조건? 을 객체식으로 넣어준다. 
  설명 필요 */
    .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    /* 1-3. .then과 callback : 연결이 된 후에 callback 함수를 실행.
    여기선 로그로 연결됬다는걸 귀엽게 표시해봤따. */
    .then(() => {
      console.log("connected to MongoDB 😍");
      /* 1-4. ApolloServer.listen : express 서버와 동일한 메커니즘이다.
      이제 서버 열림 ! */
      return server.listen({ port: PORT });
    })
    .then((res) => {
      /* 1-5. ApolloServer의 반응을 볼 수 있다. 
      근데 .then이 궁금해진다. res가 정해진 이름 같지는 않은데.
      인자값을 하나만 받는 함수로 약속이 된 듯?
      return과 server.listen이라는 맥락을 고려하는건가.
      설명 필요 */
      // res.url ?! 개편하네. ㅋㅋ res안에 다른건 별 볼거 없다.
      console.log(`Apollo Server listening : ${res.url}`);
    });
} catch (err) {
  console.error(err);
}
