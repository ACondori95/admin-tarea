const Tarea = require("../models/Tarea");
const Usuario = require("../models/Usuario");
const excelJS = require("exceljs");

// @desc   Export all tasks as an Excel file
// @route  GET /api/reports/export/tasks
// @access Private (Admin)
const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Tarea.find().populate("assignedTo", "name email");

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Informe de tareas");

    worksheet.columns = [
      {header: "ID de Tarea", key: "_id", width: 25},
      {header: "Título", key: "title", width: 30},
      {header: "Descripción", key: "description", width: 50},
      {header: "Prioridad", key: "priority", width: 15},
      {header: "Estado", key: "status", width: 20},
      {header: "Fecha de vencimiento", key: "dueDate", width: 20},
      {header: "Asignado a", key: "assignedTo", width: 30},
    ];

    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        .map((user) => `${user.name} (${user.email})`)
        .join(", ");
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: assignedTo,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformat-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_tareas.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res
      .status(500)
      .json({message: "Error al exportar tareas", error: error.message});
  }
};

// @desc   Export user-task report as an Excel file
// @route  GET /api/reports/export/users
// @access Private (Admin)
const exportUsersReport = async (req, res) => {
  try {
    const users = await Usuario.find().select("name email _id").lean();
    const userTasks = await Tarea.find().populate(
      "assignedTo",
      "name email _id"
    );

    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    userTasks.forEach((task) => {
      if (task.assignedTo) {
        task.assignedTo.forEach((assignedUser) => {
          if (userTaskMap[assignedUser._id]) {
            userTaskMap[assignedUser._id].taskCount += 1;
            if (task.status === "Pendiente") {
              userTaskMap[assignedUser._id].pendingTasks += 1;
            } else if (task.status === "En Progreso") {
              userTaskMap[assignedUser._id].inProgressTasks += 1;
            } else if (task.status === "Completada") {
              userTaskMap[assignedUser._id].completedTasks += 1;
            }
          }
        });
      }
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Informe de Tareas de Usuario");

    worksheet.columns = [
      {header: "Nombre de Usuario", key: "name", width: 30},
      {header: "Correo Electrónico", key: "email", width: 40},
      {header: "Total de Tareas Asignadas", key: "taskCount", width: 20},
      {header: "Tareas Pendientes", key: "pendingTasks", width: 20},
      {header: "Tareas en Progreso", key: "inProgressTasks", width: 20},
      {header: "Tareas Completadas", key: "completedTasks", width: 20},
    ];

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformat-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_usuarios.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res
      .status(500)
      .json({message: "Error al exportar tareas", error: error.message});
  }
};

module.exports = {exportTasksReport, exportUsersReport};
