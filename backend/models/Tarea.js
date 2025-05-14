const mongoose = require("mongoose");

const pendienteSchema = new mongoose.Schema({
  text: {type: String, required: true},
  completed: {type: Boolean, default: false},
});

const TareaSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    description: {type: String},
    priority: {type: String, enum: ["Baja", "Media", "Alta"], default: "Media"},
    status: {
      type: String,
      enum: ["Pendiente", "En Progreso", "Completada"],
      default: "Pendiente",
    },
    dueDate: {type: Date, required: true},
    assignedTo: [{type: mongoose.Schema.Types.ObjectId, ref: "Usuario"}],
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "Usuario"},
    attachments: [{type: String}],
    todoChecklist: [pendienteSchema],
    progress: {type: Number, default: 0},
  },
  {timestamps: true}
);

module.exports = mongoose.model("Tarea", TareaSchema);
