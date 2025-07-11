import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'


import { GraduationCap } from 'lucide-react';
const ROOT_SCHOOL_TRANSACTIONS = '/school-transactions'

const path = (root, item) => `${root}${item}`;

export const schoolTransactions = {
  id: 'schoolTransactions',
  type: NAV_TYPE_ROOT,
  path: '/school-transactions',
  title: 'Transacciones de Escuela',
  Icon: GraduationCap,
  childs: [
    {
      id: 'schoolTransactions.addNew',
      path: path(ROOT_SCHOOL_TRANSACTIONS, '/register'),
      type: NAV_TYPE_ITEM,
      title: 'Nueva Transacción',
      Icon: GraduationCap,
    },
    // {
    //   id: 'teachers.allTeachers',
    //   path: path(ROOT_SCHOOL_TRANSACTIONS, '/all-teachers'),
    //   type: NAV_TYPE_ITEM,
    //   title: 'Profesores',
    //   Icon: GraduationCap,
    // }
  ]
}
