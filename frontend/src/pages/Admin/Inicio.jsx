import React, {useContext, useEffect, useState} from "react";
import {useUserAuth} from "../../hooks/useUserAuth";
import {UserContext} from "../../context/UserContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {API_PATHS} from "../../utils/apiPaths";

const Inicio = () => {
  useUserAuth();

  const {user} = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_DASHBOARD_DATA
      );
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    getDashboardData();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu='Inicio'>
      {JSON.stringify(dashboardData)}
    </DashboardLayout>
  );
};

export default Inicio;
