function notFound(_req, res) {
  return res.status(404).json({ error: "Route not found." });
}

function errorHandler(error, _req, res, _next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must contain valid JSON." });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }

  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ error: "Request origin is not allowed." });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({ error: "An unexpected server error occurred." });
}

module.exports = { notFound, errorHandler };
