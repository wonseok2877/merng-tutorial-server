const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

module.exports = (context) => {
  // there will be many things inside of the context, so we should divide them
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // ? : .split()
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        // now we should verify the token by our secret key
        const user = jwt.verify(token, SECRET_KEY);
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
