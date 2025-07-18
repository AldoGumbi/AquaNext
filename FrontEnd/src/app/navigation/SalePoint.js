import {
  BanknotesIcon,
  // CurrencyDollarIcon,
  ShoppingBagIcon,
  InboxIcon,
  DivideIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';



import {
  NAV_TYPE_ROOT,
  NAV_TYPE_ITEM,
  NAV_TYPE_COLLAPSE
} from 'constants/app.constant'

const ROOT_POINT_SALE = '/sale-point';

const path = (root, item) => `${root}${item}`;

export const salePoint = {
  id: 'salePoint',
  type: NAV_TYPE_ROOT,
  path: '/sale-point',
  title: 'Punto de Venta',
  Icon: BuildingStorefrontIcon ,
  childs: [
    // POS VIEW
    {
      id: 'salePoint.home',
      path: path(ROOT_POINT_SALE, '/home'),
      type: NAV_TYPE_ITEM,
      title: 'Caja',
      Icon: BanknotesIcon,
    },
    // SALES TABLE
    // {
    //   id: 'salePoint.sales',
    //   path: path(ROOT_POINT_SALE, '/sales'),
    //   type: NAV_TYPE_ITEM,
    //   title: 'Ventas',
    //   Icon: CurrencyDollarIcon,
    // },
    // PRODUCTS
    {
      id: 'salePoint.products',
      path: path(ROOT_POINT_SALE, '/products'),
      type: NAV_TYPE_COLLAPSE,
      title: 'Productos',
      Icon: ShoppingBagIcon,
      childs: [
        // ADD NEW PRODUCT
        {
          id: 'salePoint.newProduct',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/products/add-new'),
          title: 'Registrar producto',
          Icon: 'prototypes'
        },
        // ALL PRODUCTS
        {
          id: 'salePoint.allProducts',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/products/inventory'),
          title: 'Inventario',
          Icon: 'prototypes'
        },
      ]
    },
    // // CASH REGISTER
    {
      id: 'salePoint.cashRegister',
      path: path(ROOT_POINT_SALE, '/cash-register'),
      type: NAV_TYPE_COLLAPSE,
      title: 'Caja',
      Icon: InboxIcon,
      childs: [
   
        // CASH REGISTER HOME
        {
          id: 'salePoint.cashRegisterActions',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/cash-register/home'),
          title: 'Operaciones de Caja',
          Icon: 'prototypes'
        },
        {
          id: 'salePoint.cashRegisterAddNew',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/cash-register/control-caja'),
          title: 'Control Caja',
          Icon: 'prototypes'
        }
      ]
    },
    // Discount Coupons
    {
      id: 'salePoint.DiscountCoupons',
      path: path(ROOT_POINT_SALE, '/discount-coupons'),
      type: NAV_TYPE_COLLAPSE,
      title: 'Cupones de Descuento',
      Icon: DivideIcon,
      childs: [
        // ALL DISCOUNT COUPONS
        {
          id: 'salePoint.AllDiscountCoupons',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/discount-coupons/all-coupons'),
          title: 'Cupones',
          Icon: 'prototypes'
        },
        // ADD NEW DISCOUNT COUPON
        {
          id: 'salePoint.AddDiscountCoupons',
          type: NAV_TYPE_ITEM,
          path: path(ROOT_POINT_SALE, '/discount-coupons/add-coupon'),
          title: 'Registrar Cupón',
          Icon: 'prototypes'
        },
      ]
    },

  ]
}
