const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/* 5-1. authorization function
: 우선 context라는 인자값을 받는다. */
module.exports = (context) => {
  /* 결국 HTTP protocol~~~! content-type, host, authorization 다 들어있음
  console.log(context.req.headers);
  headers: {
      host: 'localhost:4001',
      connection: 'keep-alive',
      'content-length': '165',
      'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMjA5N2RiYmIxNTM3MGI5NDkyZTliYiIsImVtYWlsIjoibmV3QGVtYWlsLmNvbSIsInVzZXJuYW1lIjoiY29uZnVzaW5nZyIsImlhdCI6MTYxMjc2MTk1NiwiZXhwIjoxNjEyNzY1NTU2fQ.9maIvuDCmHKYuYFT0_-1MHDde9sueHphnvSW8csge6M',
      'sec-ch-ua-mobile': '?0',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36',
      'content-type': 'application/json',
      origin: 'http://localhost:4001',  
      'sec-fetch-site': 'same-origin',  
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',        
      referer: 'http://localhost:4001/',      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    */
  // there will be many things inside of the context, so we should divide them
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // .split() : 특정 string값을 기준으로 전체 string을 쪼갠다.
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        /* .verify() : verify the token by our secret key
        이전에 register과 login에서 jwt.sign()를 통해 token을 만들었기 때문에, 
        토큰이 다르게 생겼어도 똑같이 verify가 가능하다. */
        const user = jwt.verify(token, SECRET_KEY);

        /*결국 user은 현재 유효하게 접속한 유저의 정보를 나타내게 된다.
        console.log(user);
          {
            id: '602097dbbb15370b9492e9bb',
            email: 'new@email.com',        
            username: 'confusingg',        
            iat: 1612761956,
            exp: 1612765556
          }
         */
        return user;
      } catch (e) {
        // AuthenticationError : from apollo server package
        throw new AuthenticationError("Invalid/Expired token👿");
      }
    }
    throw new Error('Authentification token must be "Bearer [token]');
  }
  throw new Error("Authorization header must be provided");
};
