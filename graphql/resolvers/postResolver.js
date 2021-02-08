// importing the schema of model
const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

/* 4. Resolver
what is resolvers?
: for each query or mutation or subscription, it has corresponding resolver.
process of logic of each data
컨트롤러와 흡사하다.
설명 필요
*/

/* 4-0. 결국 graphQL도 HTTP요청의 수단이다.
postman에서     {
    "query":"mutation{login(username:\"koala\", password:\"123\"){id username token}}"
}
로 post방식으로 보내면 결과는 같다. */

module.exports = {
  Query: {
    /* 4-1. typeDefs에서 정의한 Query문에 대한 함수 !
     */
    async getPosts() {
      console.log("getPosts");
      // try & catch  : 에러가 날 일은 없겠지만, 혹시나 날 경우엔 서버가 멈춘다.
      try {
        /* 4-2. DB에 접근. 
        .find ! : it will gonna fetch all of the post data in models
        mongoose.Schema에 따라 만들어진 model을 모두 찾는다. */
        // .sort : 뱉어낼 때 배열의 순서를 바꿀 수 있음.
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        // ?
        throw new Error(err);
      }
    },
    /* 4-3. 특정 id 인자값에 따른 DB 접근.
    프론트엔드 쪽에서 id를 넣고 요청할 것. 그러면 여기선 그에 맞는 data를 모두 뱉는다. */
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    // context has request body now, and we can access to the header of request, determine that this user is authentificated.
    /* ? ? :  body랑  context 어디서 오는거 ?
    설명 씹 필요.
    */
    async createPost(_, { body }, context) {
      console.log("createPosts");
      /* 5. autoriaztion logic 
      클라이언트 : 유저의 token -> 인증 header에 넣음 -> 요청
      서버 : 유저의 token -> checkAuth 함수에 넣음 -> decoding(해석)
       -> DB에 data만듬 */
      const user = checkAuth(context);
      console.log(user);
      // conditional : if the body of the post is empty, throws an error.
      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }
      // console.log(user);
      //  now the user is definitely authentificated
      /* rely on the post model that we made.
      keys will be shaped as the model defined */
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });
      // ? : 이걸 왜 저장함? 데이터베이스에 손 댄다고 여기서?
      const post = await newPost.save();

      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },

    async deletePost(_, { postId }, context) {
      console.log("deletePost");
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        // we will allow users to delete only each ones'.
        // post가 있는지 없는지 여부는 여기서 자동으로 걸러준다.
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully~~~";
        } else {
          throw new AuthenticationError("Action not allowed 💢");
        }
      } catch (e) {
        throw new Error(e);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        // 유저 한 명당 like 수는 하나다. 그래서 username이 이미 일치하면서 존재하는 경우, delete할 수 있는거. 로직 단순함.
        if (post.likes.find((like) => like.username === username)) {
          // filter ! : 방금 넣은 username값을 제외한 like들을 뱉어낸다.
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
