import React from "react";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import Ingresar from "./pages/Auth/Ingresar";
import Registrarse from "./pages/Auth/Registrarse";

import Inicio from "./pages/Admin/Inicio";
import AdministrarTareas from "./pages/Admin/AdministrarTareas";
import CrearTarea from "./pages/Admin/CrearTarea";
import AdministrarUsuarios from "./pages/Admin/AdministrarUsuarios";

import UsuarioInicio from "./pages/Usuario/UsuarioInicio";
import MisTareas from "./pages/Usuario/MisTareas";
import VerDetallesTarea from "./pages/Usuario/VerDetallesTarea";

import PrivateRoute from "./routes/PrivateRoute";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/ingresar' element={<Ingresar />} />
          <Route path='/registrarse' element={<Registrarse />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path='/admin/inicio' element={<Inicio />} />
            <Route path='/admin/tareas' element={<AdministrarTareas />} />
            <Route path='/admin/crear-tareas' element={<CrearTarea />} />
            <Route path='/admin/usuarios' element={<AdministrarUsuarios />} />
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path='/usuario/inicio' element={<UsuarioInicio />} />
            <Route path='/usuario/mis-tareas' element={<MisTareas />} />
            <Route
              path='/usuario/ver-detalles/:id'
              element={<VerDetallesTarea />}
            />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
