import React, {useContext} from "react";
import {useUserAuth} from "../../hooks/useUserAuth";
import {UserContext} from "../../context/UserContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";

const Inicio = () => {
  useUserAuth();

  const {user} = useContext(UserContext);

  return <DashboardLayout activeMenu='Inicio'>Inicio</DashboardLayout>;
};

export default Inicio;
