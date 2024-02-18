const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "You don't have access",
    });
  }
  try {
    const token = authHeader.split(" ")[1];
    const { userId } = jwt.decode(token, JWT_SECRET);
    if (!userId) {
      throw new Error();
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(403).json({
      message: "You don't have access",
    });
  }
}

module.exports = {
  authMiddleware,
};
