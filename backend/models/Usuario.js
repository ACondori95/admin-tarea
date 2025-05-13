const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profileImageUrl: {type: String, default: null},
    role: {type: String, enum: ["admin", "miembro"], default: "miembro"}, // Role-based access
  },
  {timestamps: true}
);

module.exports = mongoose.model("Usuario", UsuarioSchema);
