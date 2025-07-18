import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import {
  UserPlusIcon,
} from '@heroicons/react/24/outline';


import { SquareUserRound } from 'lucide-react';
const ROOT_ALUMNOS = '/students'

const path = (root, item) => `${root}${item}`;

export const alumnos = {
  id: 'students',
  type: NAV_TYPE_ROOT,
  path: '/students',
  title: 'Control de Alumnos',
  Icon: SquareUserRound,
  childs: [
    {
      id: 'students.addNew',
      path: path(ROOT_ALUMNOS, '/register'),
      type: NAV_TYPE_ITEM,
      title: 'Nuevo Alumno',
      Icon: UserPlusIcon,
    },
    {
      id: 'students.allStudents',
      path: path(ROOT_ALUMNOS, '/all-students'),
      type: NAV_TYPE_ITEM,
      title: 'Alumnos',
      Icon: SquareUserRound,
    },

    {
      id: 'students.transactions',
      path: path(ROOT_ALUMNOS, '/transaction'),
      type: NAV_TYPE_ITEM,
      title: 'Transacciones de Escuela',
      Icon: SquareUserRound,
    }
  ]
};
    
