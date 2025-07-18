import { NAV_TYPE_ITEM, } from "constants/app.constant";
import { 
  UsersRound,
  SquareUserRound,
  House
} from 'lucide-react';

import {
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

export const baseNavigation = [
  {
    id: 'dashboards',
    type: NAV_TYPE_ITEM,
    path: '/dashboards',
    title: 'Dashboards',
    Icon: House,
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
  {
    id: 'salePoint',
    type: NAV_TYPE_ITEM,
    path: '/sale-point',
    title: 'Punto de Venta',
    Icon: BuildingStorefrontIcon,
  },
];
