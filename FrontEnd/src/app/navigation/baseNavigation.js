import { NAV_TYPE_ITEM, } from "constants/app.constant";
import { House } from 'lucide-react';
import { SquareUserRound } from 'lucide-react';
import { Store } from 'lucide-react';

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
]
