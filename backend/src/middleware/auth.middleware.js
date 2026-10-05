const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authorization = req.get("authorization");
  const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      typeof payload.userType !== "string"
    ) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.user = { id: payload.sub, userType: payload.userType };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
