/* 3. mongoDB와의 연결
mongoDB is schema-less and doesn't have relations,
but to make it safe with our server codes.
let's have relations between our models.
*/
const mongoose = require("mongoose");

/* 3-1. mongoose.schema !
실제 DB의 모양을 결정짓는다.
*/
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
});

/* 3-2. mongoose.model
: Schema에 따라 모델을 만든다.
! : 결국  graphQL은 DB의 model에서 data들을 찾아서 뱉어내는 거! 조리돌림. */
module.exports = mongoose.model("User", userSchema);
