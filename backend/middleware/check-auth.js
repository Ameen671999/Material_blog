const jwt = require("jsonwebtoken");

module.exports = (req, res, next) =>{
  try{
    const token = req.headers.authorization.split(" ")[1];// most of the API are like this
    const decodedToken =  jwt.verify(token, process.env.JWT_KEY);//authorization only nows this secret
    req.userData = {email: decodedToken.email,
       userId: decodedToken.userId}
    next();
  } catch(error) {
    res.status(401).json({
      message: "You are not authenticated!"
    })
  }
}
