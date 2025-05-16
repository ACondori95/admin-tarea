const Tarea = require("../models/Tarea");

// @desc   Get all tasks (Admin: all, User: only assigned tasks)
// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const {status} = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    let tasks;

    if (req.user.role === "admin") {
      tasks = await Tarea.find(filter).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    } else {
      tasks = await Tarea.find({...filter, assignedTo: req.user._id}).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    }

    // Add completed todoChecklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return {...task._doc, completedTodoCount: completedCount};
      })
    );

    // Status summary counts
    const allTasks = await Tarea.countDocuments(
      req.user.role === "admin" ? {} : {assignedTo: req.user._id}
    );

    const pendingTasks = await Tarea.countDocuments({
      ...filter,
      status: "Pendiente",
      ...(req.user.role !== "admin" && {assignedTo: req.user._id}),
    });

    const inProgressTasks = await Tarea.countDocuments({
      ...filter,
      status: "En Progreso",
      ...(req.user.role !== "admin" && {assignedTo: req.user._id}),
    });

    const completedTasks = await Tarea.countDocuments({
      ...filter,
      status: "Completada",
      ...(req.user.role !== "admin" && {assignedTo: req.user._id}),
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Get task by ID
// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  try {
    const task = await Tarea.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    if (!task) return res.status(404).json({message: "Tarea no encontrada"});

    res.json(task);
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Create a new task (Admin only)
// @route  POST /api/tasks
// @access Private (Admin)
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({message: "assignedTo debe ser un array de IDs de usuarios"});
    }

    const task = await Tarea.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoChecklist,
      attachments,
    });

    res.status(201).json({message: "Tarea creada con éxito", task});
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Update task details
// @route  PUT /api/tasks/:id
// @access Private (Admin)
const updateTask = async (req, res) => {
  try {
    const task = await Tarea.findById(req.params.id);

    if (!task) return res.status(404).json({message: "Tarea no encontrada"});

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({message: "assignedTo debe ser un array de IDs de usuarios"});
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({message: "Tarea actualizada con éxito", updatedTask});
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Delete a task (Admin only)
// @route  DELETE /api/tasks/:id
// @access Private (Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Tarea.findById(req.params.id);

    if (!task) return res.status(404).json({message: "Tarea no encontrada"});

    await task.deleteOne();
    res.json({message: "Tarea eliminada con éxito"});
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Update task status
// @route  PUT /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Tarea.findById(req.params.id);
    if (!task) return res.status(404).json({message: "Tarea no encontrada"});

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({message: "No autorizado"});
    }

    task.status = req.body.status || task.status;

    if (task.status === "Completeda") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json({message: "Estado de la tarea actualizado", task});
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Update task checklist
// @route  PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
  try {
    const {todoChecklist} = req.body;
    const task = await Tarea.findById(req.params.id);

    if (!task) return res.status(404).json({message: "Tarea no encontrada"});

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({
        message: "No estás autorizado para actualizar la lista de verificación",
      });
    }

    task.todoChecklist = todoChecklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Auto-mark task as completed if all items are checked
    if (task.progress === 100) {
      task.status = "Completada";
    } else if (task.progress > 0) {
      task.status = "En Progreso";
    } else {
      task.status = "Pendiente";
    }

    await task.save();
    const updatedTask = await Tarea.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({
      message: "Lista de verificación de tareas actualizada",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Dashboard Data (Admin only)
// @route  GET /api/tasks/dashboard-data
// @access Private
const getDashboardData = async (req, res) => {
  try {
    // Fetch statistics
    const totalTasks = await Tarea.countDocuments();
    const pendingTasks = await Tarea.countDocuments({status: "Pendiente"});
    const completedTasks = await Tarea.countDocuments({status: "Completada"});
    const overdueTasks = await Tarea.countDocuments({
      status: {$ne: "Completada"},
      dueDate: {$lt: new Date()},
    });

    // Ensure all possible statuses are included
    const taskStatuses = ["Pendiente", "En Progreso", "Completada"];
    const taskDistributionRaw = await Tarea.aggregate([
      {$group: {_id: "$status", count: {$sum: 1}}},
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["Todo"] = totalTasks; // Add total count to taskDistribution

    // Ensure all priority levels are included
    const taskPriorities = ["Baja", "Media", "Alta"];
    const taskPriorityLevelsRaw = await Tarea.aggregate([
      {$group: {_id: "$priority", count: {$sum: 1}}},
    ]);
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks
    const recentTasks = await Tarea.find()
      .sort({createdAt: -1})
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {totalTasks, pendingTasks, completedTasks, overdueTasks},
      charts: {taskDistribution, taskPriorityLevels},
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

// @desc   Dashboard Data (User-specific)
// @route  GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // Only fetch data for the logged-in user

    // Fetch statistics for user-specific tasks
    const totalTasks = await Tarea.countDocuments({assignedTo: userId});
    const pendingTasks = await Tarea.countDocuments({
      assignedTo: userId,
      status: "Pendiente",
    });
    const completedTasks = await Tarea.countDocuments({
      assignedTo: userId,
      status: "Completada",
    });
    const overdueTasks = await Tarea.countDocuments({
      assignedTo: userId,
      status: {$ne: "Completada"},
      dueDate: {$lt: new Date()},
    });

    // Task distribution by status
    const taskStatuses = ["Pendiente", "En Progreso", "Completada"];
    const taskDistributionRaw = await Tarea.aggregate([
      {$match: {assignedTo: userId}},
      {$group: {_id: "$status", count: {$sum: 1}}},
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["Todo"] = totalTasks;

    // Task distribution by priority
    const taskPriorities = ["Baja", "Media", "Alta"];
    const taskPriorityLevelsRaw = await Tarea.aggregate([
      {$match: {assignedTo: userId}},
      {$group: {_id: "$priority", count: {$sum: 1}}},
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks for the logged-in user
    const recentTasks = await Tarea.find()
      .sort({createdAt: -1})
      .limit(10)
      .select("title status priority dueDate createdAd");

    res.status(200).json({
      statistics: {totalTasks, pendingTasks, completedTasks, overdueTasks},
      charts: {taskDistribution, taskPriorityLevels},
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({message: "Error del servidor", error: error.message});
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
