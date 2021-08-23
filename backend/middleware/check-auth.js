const jwt = require("jsonwebtoken");

module.exports = (req, res, next) =>{
  try{
    const token = req.headers.authorization.split(" ")[1];// most of the API are like this
    jwt.verify(token, "secret_this_should_be_long");//authorization only nows this secret
  next();
  } catch(error) {
    res.status(401).json({
      message: "Auth failed"
    })
  }
}
