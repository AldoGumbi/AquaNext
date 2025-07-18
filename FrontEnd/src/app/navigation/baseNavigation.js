import { NAV_TYPE_ITEM, } from "constants/app.constant";
import { 
  UsersRound,
  Store,
  SquareUserRound,
  House
} from 'lucide-react';

export const baseNavigation = [
  {
    id: 'dashboards',
    type: NAV_TYPE_ITEM,
    path: '/dashboards',
    title: 'Dashboards',
    Icon: House,
  },
  {
    id: 'salePoint',
    type: NAV_TYPE_ITEM,
    path: '/salePoint',
    title: 'Punto de Venta',
    Icon: Store,
  },
  {
    id: 'students',
    type: NAV_TYPE_ITEM,
    path: '/students',
    title: 'Alumnos',
    Icon: SquareUserRound,
  },
  {
    id: 'controlClases', // 👈 este es el que debe cambiar
    type: NAV_TYPE_ITEM, // 👈 IMPORTANTE: debe ser ROOT
    path: '/control-clases', // aunque este path sea ficticio, sirve como agrupador
    title: 'Control de Clases',
    Icon: UsersRound,
  },
];
