const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const jwtToken = req.cookies.token;
  if (!jwtToken) return res.status(403).json("You are not authenticated!");

  try {
    const tokenUser = jwt.verify(jwtToken, process.env.SECRET_KEY);

    req.user = tokenUser;
    next();
  } catch (err) {
    res.status(403).json("Token is not valid");
    console.log(err.message);
  }
};
