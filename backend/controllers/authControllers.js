const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const {name, email, password, profileImageUrl, adminInviteToken} = req.body;

    // Check if user already exists
    const userExists = await Usuario.findOne({email});
    if (userExists) {
      return res.status(400).json({message: "El usuario ya existe"});
    }

    // Determine user role: Admin if correct token is provided, otherwise Member
    let role = "miembro";
    if (
      adminInviteToken &&
      adminInviteToken == process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await Usuario.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    // Return user data with JWT
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
    console.log("### error ---> ", error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await Usuario.findOne({email});
    if (!user) {
      return res
        .status(401)
        .json({message: "Correo electrónico o contraseña inválidos"});
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({message: "Correo electrónico o contraseña inválidos"});
    }

    // Return user data with JWT
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Get user profile
// @route  GET /api/auth/profile
// @access Private (Requires JWT)
const getUserProfile = async (req, res) => {
  try {
    const user = await Usuario.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({message: "Usuario no encontrado"});
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
// @access Private (Requires JWT)
const updateUserProfile = async (req, res) => {
  try {
    const user = await Usuario.findById(req.user.id);

    if (!user) {
      return res.status(404).json({message: "Usuario no encontrado"});
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

module.exports = {registerUser, loginUser, getUserProfile, updateUserProfile};
