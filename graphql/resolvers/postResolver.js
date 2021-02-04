// importing the schema of model
const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

/* what is resolvers?
: for each query or mutation or subscription, it has corresponding resolver.
process of logic of each data  
설명 필요
*/

/* 결국 graphQL도 HTTP요청의 수단이다.
postman에서     {
    "query":"mutation{login(username:\"koala\", password:\"123\"){id username token}}"
}
로 post방식으로 보내면 결과는 같다. */

module.exports = {
  Query: {
    async getPosts() {
      console.log("getPosts");
      try {
        // .find !  : it will gonna fetch all of the data in models
        // .sort : 뱉어낼 때 배열의 순서를 바꿀 수 있음.
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        // ?
        throw new Error(err);
      }
    },
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
  // mutation
  Mutation: {
    // context has request body now, and we can access to the header of request, determine that this user is authentificated.
    async createPost(_, { body }, context) {
      console.log("createPosts");
      /* logic : user will get auth token and then
       they put it in autorization header, send the header to request,
       then we need to get that token and decode it,
       and get the information that the user is authentificated for sure.
       finally, we create a post.*/
      const user = checkAuth(context);

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
