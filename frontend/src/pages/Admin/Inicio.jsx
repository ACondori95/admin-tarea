import React, {useContext, useEffect, useState} from "react";
import {useUserAuth} from "../../hooks/useUserAuth";
import {UserContext} from "../../context/UserContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {API_PATHS} from "../../utils/apiPaths";
import InfoCard from "../../components/Cards/InfoCard";
import {addThousandsSeparator} from "../../utils/helper";
import {LuArrowRight} from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";

const COLORS = ["#8d51ff", "#00b8db", "#7bce00"];

const Inicio = () => {
  useUserAuth();

  const {user} = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // Prepare Chart Data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      {status: "Pendiente", count: taskDistribution?.Pendiente || 0},
      {status: "En Progreso", count: taskDistribution?.EnProgreso || 0},
      {status: "Completada", count: taskDistribution?.Completada || 0},
    ];

    setPieChartData(taskDistributionData);

    const priorityLevelsData = [
      {priority: "Baja", count: taskPriorityLevels?.Baja || 0},
      {priority: "Media", count: taskPriorityLevels?.Media || 0},
      {priority: "Alta", count: taskPriorityLevels?.Alta || 0},
    ];

    setBarChartData(priorityLevelsData);
  };

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_DASHBOARD_DATA
      );
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const onSeeMore = () => {
    navigate("/admin/tareas");
  };

  useEffect(() => {
    getDashboardData();

    return () => {};
  }, []);

  const now = new Date();
  const weekdayFormatter = new Intl.DateTimeFormat("es-AR", {weekday: "long"});
  let weekday = weekdayFormatter.format(now);
  weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const day = now.getDate();
  const monthFormatter = new Intl.DateTimeFormat("es-AR", {month: "long"});
  let month = monthFormatter.format(now);
  month = month.charAt(0).toUpperCase() + month.slice(1);
  const year = now.getFullYear();
  const fechaFinal = `${weekday} ${day} de ${month} de ${year}`;

  return (
    <DashboardLayout activeMenu='Inicio'>
      <div className='card my-5'>
        <div>
          <div className='col-span-3'>
            <h2 className='text-xl md:text-2xl'>¡Buenos Días {user?.name}!</h2>
            <p className='text-xs md:text-[13px] text-gray-400 mt-1.5'>
              {fechaFinal}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
          <InfoCard
            label='Tareas Totales'
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Todo || 0
            )}
            color='bg-primary'
          />

          <InfoCard
            label='Tareas Pendientes'
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pendiente || 0
            )}
            color='bg-violet-500'
          />

          <InfoCard
            label='Tareas en Progreso'
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.EnProgreso || 0
            )}
            color='bg-cyan-500'
          />

          <InfoCard
            label='Tareas Completadas'
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completada || 0
            )}
            color='bg-lime-500'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6'>
        <div>
          <div className='card'>
            <div className='flex items-center justify-between'>
              <h5 className='font-medium'>Distribución de Tareas</h5>
            </div>

            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className='card'>
            <div className='flex items-center justify-between'>
              <h5 className='font-medium'>Niveles de Prioridad de Tareas</h5>
            </div>

            <CustomBarChart data={barChartData} />
          </div>
        </div>

        <div className='md:col-span-2'>
          <div className='card'>
            <div className='flex items-center justify-between'>
              <h5 className='text-lg'>Tareas Recientes</h5>

              <button className='card-btn' onClick={onSeeMore}>
                Ver Todo <LuArrowRight className='text-base' />
              </button>
            </div>

            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inicio;
