const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const userType = payload.userType || payload.role;
    const userId = payload.sub || payload.id;
    if (userType !== "admin" || typeof userId !== "string") {
      return res.status(403).json({ error: "Insufficient privileges" });
    }
    req.user = { id: userId, userType, role: userType };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { verifyAdmin };
