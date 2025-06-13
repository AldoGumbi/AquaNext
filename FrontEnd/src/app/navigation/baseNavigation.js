import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'

export const baseNavigation = [
  {
      id: 'dashboards',
      type: NAV_TYPE_ITEM,
      path: '/dashboards',
      title: 'Dashboards',
      Icon: DashboardsIcon,
  },
  {
    id: 'salePoint',
    type: NAV_TYPE_ITEM,
    path: '/salePoint',
    title: 'Punto de Venta',
    Icon: DashboardsIcon,
  },
]
