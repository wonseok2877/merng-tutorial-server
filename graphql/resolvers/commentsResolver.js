const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      // logged in authorization
      // { username } = user.username
      const { username } = checkAuth(context);
      // conditional : body가 비어있을 경우 에러 던짐.
      if (body.trim() === "") {
        // UserInputError
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty!",
          },
        });
      }
      // .findById
      const post = await Post.findById(postId);

      if (post) {
        // because mongoose turns the module to json object..?
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError("Post not founed");
    },
    // deleteComment는 보안 체크다. 어차피 해당 코멘트의 유저가 아닐 경우 프론트에서 삭제버튼부터가 안 뜰 것이므로.
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);

      if (post) {
        /*after we find the index of comments, then we delete that.
            우리가 넣은 코멘트 id와 실제 코멘트의 id가 일치하는지 확인한뒤, 그 comments를 가져온다.
            .findIndex : 순서를 가져온다. 설명 필요.*/
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        // conditional : 그 다음엔 코멘트의 username이 checkAuth함수를 거쳐 만들어진 username과 같으면, 즉 해당 코멘드를 쓴 사람일 경우에만 실행
        if (post.comments[commentIndex].username === username) {
          // splice() : javascript의 array method다. 해당 index위치의 코멘트를 하나 지워줌.
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError(
            "You are not the owner of this comment"
          );
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
