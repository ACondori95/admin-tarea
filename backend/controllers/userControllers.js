const Tarea = require("../models/Tarea");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

// @desc   Get all users (Admin only)
// @route  GET /api/users
// @access Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await Usuario.find({role: "miembro"}).select("-password");

    // Add task counts to each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Tarea.countDocuments({
          assignedTo: user._id,
          status: "Pendiente",
        });
        const inProgressTasks = await Tarea.countDocuments({
          assignedTo: user._id,
          status: "En Progreso",
        });
        const completedTasks = await Tarea.countDocuments({
          assignedTo: user._id,
          status: "Completeda",
        });

        return {...user._doc, pendingTasks, inProgressTasks, completedTasks};
      })
    );

    res.json(usersWithTaskCounts);
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Get user by ID
// @route  GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({message: "Usuario no encontrado"});
    res.json(user);
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

module.exports = {getUsers, getUserById};
