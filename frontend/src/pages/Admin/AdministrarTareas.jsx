import React, {useEffect, useState} from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {API_PATHS} from "../../utils/apiPaths";
import {LuFileSpreadsheet} from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";

const AdministrarTareas = () => {
  const [allTasks, setAllTasks] = useState([]);

  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Todo");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {status: filterStatus === "Todo" ? "" : filterStatus},
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Map statusSummary data with fixed labels and order
      const statusSummary = response.data?.statusSummary || {};

      const statusArray = [
        {label: "Todo", count: statusSummary.all || 0},
        {label: "Pendiente", count: statusSummary.pendingTasks || 0},
        {label: "En Progreso", count: statusSummary.inProgressTasks || 0},
        {label: "Completada", count: statusSummary.completedTasks || 0},
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const handleClick = (taskData) => {
    navigate("/admin/crear-tareas", {state: {taskId: taskData._id}});
  };

  // download task report
  const handleDownloadReport = async () => {};

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu='Administrar Tareas'>
      <div className='my-5'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-xl md:text-xl font-medium'>Mis Tareas</h2>

            <button
              className='flex lg:hidden download-btn'
              onClick={handleDownloadReport}>
              <LuFileSpreadsheet className='text-lg' />
              Descargar Reporte
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className='flex items-center gap-3'>
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button
                className='hidden lg:flex download-btn'
                onClick={handleDownloadReport}>
                <LuFileSpreadsheet className='text-lg' />
                Descargar Reporte
              </button>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {allTasks?.map((item, index) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => {
                handleClick(item);
              }}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdministrarTareas;
