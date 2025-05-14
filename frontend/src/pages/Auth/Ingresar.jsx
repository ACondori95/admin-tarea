import React, {useContext, useState} from "react";
import AuthLayout from "../../components/Layouts/AuthLayout";
import {Link, useNavigate} from "react-router-dom";
import Input from "../../components/Inputs/Input";
import {validateEmail} from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import {API_PATHS} from "../../utils/apiPaths";
import {UserContext} from "../../context/UserContext";

const Ingresar = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();

  // Handle Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError(
        "Por favor, ingresá una dirección de correo electrónico válida."
      );
      return;
    }

    if (!password) {
      setError("Por favor, ingresá la contraseña.");
      return;
    }

    setError("");

    // Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const {token, role} = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/inicio");
        } else {
          navigate("/usuario/inicio");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Algo salió mal. Por favor, intentá de nuevo.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>
          Bienvenid@ de nuevo
        </h3>
        <p className='text-xs text-slate-700 mt-[5px] pb-6'>
          Por favor, ingresá tus datos para iniciar sesión
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({target}) => setEmail(target.value)}
            label='Dirección de Correo Electrónico'
            placeholder='ejemplo@email.com'
            type='text'
          />

          <Input
            value={password}
            onChange={({target}) => setPassword(target.value)}
            label='Contraseña'
            placeholder='Min 8 Caracteres'
            type='password'
          />

          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type='submit' className='btn-primary'>
            INICIAR SESIÓN
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            ¿No tenés una cuenta?{" "}
            <Link
              className='font-medium text-primary underline'
              to='/registrarse'>
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Ingresar;
