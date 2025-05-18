import {
  LuClipboardCheck,
  LuLayoutDashboard,
  LuLogOut,
  LuSquarePlus,
  LuUsers,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {id: "01", label: "Inicio", icon: LuLayoutDashboard, path: "/admin/inicio"},
  {
    id: "02",
    label: "Administrar Tareas",
    icon: LuClipboardCheck,
    path: "/admin/tareas",
  },
  {
    id: "03",
    label: "Crear Tarea",
    icon: LuSquarePlus,
    path: "/admin/crear-tareas",
  },
  {
    id: "04",
    label: "Miembros del Equipo",
    icon: LuUsers,
    path: "/admin/usuarios",
  },
  {id: "05", label: "Salir", icon: LuLogOut, path: "salir"},
];

export const SIDE_MENU_USER_DATA = [
  {id: "01", label: "Inicio", icon: LuLayoutDashboard, path: "/usuario/inicio"},
  {
    id: "02",
    label: "Mis Tareas",
    icon: LuClipboardCheck,
    path: "/usuario/mis-tareas",
  },
  {id: "05", label: "Salir", icon: LuLogOut, path: "salir"},
];

export const PRIORITY_DATA = [
  {label: "Baja", value: "Baja"},
  {label: "Media", value: "Media"},
  {label: "Alta", value: "Alta"},
];

export const STATUS_DATA = [
  {label: "Pendiente", value: "Pendiente"},
  {label: "En Progreso", value: "En Progreso"},
  {label: "Completada", value: "Completada"},
];
