import { NAV_TYPE_ITEM, } from "constants/app.constant";
import { 
  GraduationCap,
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
    id: 'teachers',
    type: NAV_TYPE_ITEM,
    path: '/teachers',
    title: 'Profesores',
    Icon: GraduationCap,
  },
  {
    id: 'groups',
    type: NAV_TYPE_ITEM,
    path: '/groups',
    title: 'Grupos',
    Icon: UsersRound,
  },
]
