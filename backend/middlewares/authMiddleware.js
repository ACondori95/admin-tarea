const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Usuario.findById(decoded.id).select("-password");
      next();
    } else {
      res.status(401).json({message: "No autorizado, sin token"});
    }
  } catch (error) {
    res.status(401).json({message: "El token falló", error: error.message});
  }
};

// Middleware for Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({message: "Acceso denegado, solo administradores"});
  }
};

module.exports = {protect, adminOnly};
