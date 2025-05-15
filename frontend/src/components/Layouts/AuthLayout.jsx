import React from "react";

const AuthLayout = ({children}) => {
  return (
    <div className='flex'>
      <div className='w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12'>
        <h2 className='text-lg font-medium text-black'>Gestor de Tareas</h2>
        {children}
      </div>

      <div className='hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-[url("https://placehold.co/600x400")] bg-cover bg-no-repeat bg-center overflow-hidden p-8'>
        <img src='https://placehold.co/600x400' className='w-64 lg:w-[90%]' />
      </div>
    </div>
  );
};

export default AuthLayout;
