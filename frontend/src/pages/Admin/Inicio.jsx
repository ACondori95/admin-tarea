import React, {useContext} from "react";
import {useUserAuth} from "../../hooks/useUserAuth";
import {UserContext} from "../../context/UserContext";

const Inicio = () => {
  useUserAuth();

  return <div>Inicio</div>;
};

export default Inicio;
