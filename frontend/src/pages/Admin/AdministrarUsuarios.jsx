import React, {useEffect, useState} from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import {API_PATHS} from "../../utils/apiPaths";
import {LuFileSpreadsheet} from "react-icons/lu";

const AdministrarUsuarios = () => {
  const [allUsers, setAllUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  // download task report
  const handleDownloadReport = async () => {};

  useEffect(() => {
    getAllUsers();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu='Miembros del Equipo'>
      <div className='mt-5 mb-10'>
        <div className='flex md:flex-row md:items-center justify-between'>
          <h2 className='text-xl md:text-xl font-medium'>
            Miembros del Equipo
          </h2>

          <button
            className='flex md:flex download-btn'
            onClick={handleDownloadReport}>
            <LuFileSpreadsheet className='text-lg' /> Descargar Reporte
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'></div>
      </div>
    </DashboardLayout>
  );
};

export default AdministrarUsuarios;
