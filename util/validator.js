/* validation !
설명 필요
 */
// 인자값을 4개나 처먹네
module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  // register섹션에서 빈 string 값일 떄 error을 던진다.
  // ? : .trim()은 걍 string 양끝의 공백 없애주는 함수
  if (username.trim() === "") {
    errors.username = "Username must not be empty 😜";
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty 😜";
  } else {
    // regular expression ! : 이메일 칸을 더 구체적으로 validation.
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // ? : .match는 뭐야
    if (!email.match(regEx)) {
      errors.email = "Invalid email address";
    }
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match ㅗ";
  }

  // 여기서 뱉는 errors와 valid는 userResolver에서 쓴다.
  return {
    errors,
    /* ! Objecy.keys
    : 해당 객체의 key를 인식한다 와우 
    즉  error가 없어야 valid가 참이 되는 것. */
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty 😜";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty 😜";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
