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

/* 1-1. how can I play in Apollo server ?
: new ApolloServer ! npm package임.
it needs the typedef of GraphQL and the resolvers.*/
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  /* don't make a mistake adding this middleware for all express server itself.
  that allows even non protected routes.
  so we are gonna make context.*/
  // take the req.body to the context. and access to the request in our context.
  context: ({ req }) => ({ req, pubsub }),
});

// error : ID cannot represent value: {_bsontype: \"ObjectID\" 해결 복붙 ..
ObjectId.prototype.valueOf = function () {
  return this.toString();
};

/* 1. connecting to mongoDB !
설명 필요.
어디서부터 DB와 연결되고 어디서 응답하며 어디서 요청하고 있는지. */
// before connect(), we should set the connect in mongoDB Atlas.
try {
  mongoose
    .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("connected to DB !");
      return server.listen({ port: PORT });
    })
    .then((res) => {
      // res.url ?! 개편하네. ㅋㅋ
      console.log(`Server is listening to : ${res.url}`);
    });
} catch (err) {
  console.error(err);
}
