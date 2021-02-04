const { UserInputError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validator");

// token을 만드는 function.
function generateToken(u) {
  // ? : jwt
  // ? : .sign
  return jwt.sign(
    {
      // ? : 값들이 어디로 들어가는거야
      id: u.id,
      email: u.email,
      username: u.username,
    },
    // secret whatever
    SECRET_KEY,
    // ? : 무슨 시간을 말하는 거야
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    // because we defined the types in typeDefs, we don't have to destructure them
    async login(_, { username, password }) {
      // ! : login 함수의 인자값 둘을 validator에 넣고, 그 값인 errors와 valid 를 받는다.
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors!", { errors });
      }

      // conditional : errors가 참일 경우에 로그인을 시키지 않는다.
      const exUser = await User.findOne({ username });
      if (!exUser) {
        errors.general = "User not found";
        throw new UserInputError("Wrong credentials", { errors });
      }
      // conditional : 유저가 넣은 password값과 실제 password값이 일치하는지 확인
      const match = await bcrypt.compare(password, exUser.password);
      if (!match) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }
      // ! : 이제 로그인 성공했으므로 token을 던져준다.
      const token = generateToken(exUser);

      return {
        ...exUser._doc,
        id: exUser._id,
        token,
      };
    },
    /* resolver arguments !
        : there can be 4 arguments in resolver.
        parent: the result of what was the input of last step before this step. it is used when there are multiple inputs
        args :  registerInput in this case. 
        context : 
        info : general information about some meta data, almost never needed..*/
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      /* validate user data !
      설명 필요
       */
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      // if register input is not valid, we will throw errors, that we defined in validators.js
      if (!valid) {
        throw new UserInputError("Errorrrrs", { errors });
      }
      // ? : .findOne schema에서 가져온다는게 뭔소리? 실제 데이터를 가져와야 하는거 아닌가.
      const user = await User.findOne({ username });
      // 유저 중복 방지 로직 ! user값이 이미 참일 때 에러 던지기
      if (user) {
        throw new UserInputError("Username is taken already", {
          // this error object will used to display the error in frontend.
          errors: {
            username: "This user name is taken haha",
          },
        });
      }
      //   premise : bycriptjs package and jsonwebtoken package makes the password json data to token, token to json data
      password = await bcrypt.hash(password, 12);

      // pass the data that we have
      /* 새로운  */
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });
      /* ! :  */
      const res = await newUser.save();

      /*   before  return the data to user 
    we need to create a token for our user.
    ? : .sign이 뭐야. payload 개념은 또 뭐고.*/
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
