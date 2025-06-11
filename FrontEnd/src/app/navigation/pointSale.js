import {
  HomeIcon,
} from '@heroicons/react/24/outline';

import { Store } from 'lucide-react';



import { NAV_TYPE_ROOT, NAV_TYPE_ITEM, NAV_TYPE_COLLAPSE } from 'constants/app.constant'

const ROOT_POINT_SALE = '/point-sale';

const path = (root, item) => `${root}${item}`;

export const pointSale = {
  id: 'pointSale',
  type: NAV_TYPE_ROOT,
  path: '/point-sale',
  title: 'Punto de Venta',
  // transKey: 'nav.dashboards.dashboards',
  Icon: Store,
  childs: [
    {
      id: 'pointSale.home',
      path: path(ROOT_POINT_SALE, '/home'),
      type: NAV_TYPE_ITEM,
      title: 'Inicio',
      Icon: HomeIcon,
    },
    {
      id: 'pointSale.sales',
      path: path(ROOT_POINT_SALE, '/home'),
      type: NAV_TYPE_ITEM,
      title: 'Ventas',
      Icon: HomeIcon,
    },
    {
      id: 'pointSale.products',
      path: path(ROOT_POINT_SALE, '/onboarding'),
      type: NAV_TYPE_COLLAPSE,
      title: 'Productos',
      Icon: Store,
      childs: [
        {
          id: 'pointSale.newProduct',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/onboarding/onboarding-1'),
          title: 'Registrar producto',
          Icon: 'prototypes'
        },
        {
          id: 'pointSale.allProducts',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/onboarding/onboarding-1'),
          title: 'Inventario',
          Icon: 'prototypes'
        },
      ]
    },
    {
      id: 'pointSale.cashRegister',
      path: path(ROOT_POINT_SALE, '/onboarding'),
      type: NAV_TYPE_COLLAPSE,
      title: 'Caja',
      Icon: Store,
      childs: [
        {
          id: 'pointSale.cashRegisterActions',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/onboarding/onboarding-1'),
          title: 'Inicio',
          Icon: 'prototypes'
        },
        {
          id: 'pointSale.cashRegisterHistory',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/onboarding/onboarding-1'),
          title: 'Historial de cajas',
          Icon: 'prototypes'
        },


      ]
    },

  ]
}
