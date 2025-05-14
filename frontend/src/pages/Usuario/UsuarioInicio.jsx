import React from "react";
import {useUserAuth} from "../../hooks/useUserAuth";

const UsuarioInicio = () => {
  useUserAuth();

  return <div>UsuarioInicio</div>;
};

export default UsuarioInicio;
