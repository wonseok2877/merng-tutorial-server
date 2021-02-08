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
  // jwt ? : jsonwebtoken. incrypt the encoded data in token
  // .sign ?  : Synchronously sign the given payload into a JSON Web Token string payload
  return jwt.sign(
    {
      // ? : 값들이 어디로 들어가는거야
      id: u.id,
      email: u.email,
      username: u.username,
    },
    // 미리 지정해놓은 비밀 키. 이것을 통해서 token을 만들고 해석한다.
    SECRET_KEY,
    // expiresIn : expiration 토큰의 유효 기간.
    { expiresIn: "1h" }
  );
}

module.exports = {
  /* 4-4. Mutation
   */
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
        throw new UserInputError("Wrong credentials 😜", { errors });
      }
      /* .compare ! 
      : bycrypt만의 방식으로 얘네 둘을 비교해서 같은 유저의 password인지 알아 볼 수 있다! */
      const match = await bcrypt.compare(password, exUser.password);
      // conditional : 유저가 넣은 password값과 실제 password값이 일치하는지 확인
      if (!match) {
        errors.general = "Wrong credentials 😜";
        throw new UserInputError("Wrong credentials 😜", { errors });
      }
      // ! : 이제 로그인 성공했으므로 token을 던져준다.
      const token = generateToken(exUser);

      return {
        ...exUser._doc,
        id: exUser._id,
        token,
      };
    },
    /* 4-5. resolver arguments !
        : there can be 4 arguments in resolver.
        parent: 여러 resolver가 사슬처럼 연결될 때, 그 부모 resolver을 칭한다. 여기선 없음.
        the result of what was the input of last step before this step. it is used when there are multiple inputs
        args :  arguments. 함수의 인자값과 정말 비슷하다. register라는 함수를 
        실행시키려면 registerInput이라는 object인자값을 넣어야 하는 느낌이다.
        context : 
        info : 거의 쓸 일 없음 ㅋㅋ general information about some meta data*/
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      /* 4-6. validation !
      : Resolver에서 받은 registerInput의 인자값들을 validator로 보낸 뒤 
      validator에서 그 값들에 대해 어떻게 해야 유효한 값인지 정의를 하고,
      그에 따라 정의해놓은 error과 valid를 Resolver에서 갖고 논다.
       */
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      // if register input is not valid, we will throw errors, that we defined in validators.js
      /* 4-7. Resolver의 역할 : 유효성 판단이 아닌 유효성에 따라 의사 결정
      validator과 엄연히 다르다.
      여기선 핵심적인 가치 판단을 한다. valid가 아닐 경우 error을 던진다. */
      if (!valid) {
        throw new UserInputError("Errorrrrs", { errors });
      }
      // ? : .findOne schema에서 가져온다는게 뭔소리? 실제 데이터를 가져와야 하는거 아닌가.
      /* 4-8. Resolver의 역할 : DB에 접근
      User model에서 해당 이름에 대한걸 뒤적뒤적 찾아본뒤,
      유저 중복 방지 로직 ! 조건문으로 상황에 따라 에러를 던진다. */
      const user = await User.findOne({ username });
      if (user) {
        // UserInputError : Apollo server의 에러 함수
        throw new UserInputError("Username is taken already", {
          /* ?? 왜 따로 errors를 만드는거? 
          : this error object will used to display the error in frontend.
          */
          errors: {
            username: "This user name is taken haha",
          },
        });
      }
      //   premise : bycriptjs package and jsonwebtoken package makes the password json data to token, token to json data
      // ? : password에다가 bycrypt된 새로운 password값을 넣은건가?
      password = await bcrypt.hash(password, 12);

      // pass the data that we have
      /* 새로운  */
      const newUser = new User({
        username,
        password,
        email,
        createdAt: new Date().toISOString(),
      });
      /* .save : new User과 그 인자값에 따라 새로운 data를 만든다. */
      const res = await newUser.save();
      console.log(res);
      /* mongoose의 respond !!
      {
        mongoose가 임의로 만드는 id !
          _id: 60209e9e5e8bcb17bc3626ca,        
        순서는 resolver에서 정해준대로. 
          username: 'practice',
        bycrypt된 새로운 password. 나중에 로그인할땐 bycrypt.compare로 비교.
          password: '$2a$12$1RzqpeT05OBQ.GvycMNWZuAvaM.C.c8uCpUq3A/KSWGPnoTQheNYO',     
          email: 'new@email.com',
          createdAt: '2021-02-08T02:14:54.243Z',
          __v: 0
        } */

      const token = generateToken(res);
      console.log(res._doc);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
