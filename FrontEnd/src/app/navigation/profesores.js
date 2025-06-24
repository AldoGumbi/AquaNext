import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'


import { GraduationCap } from 'lucide-react';
const ROOT_PROFESORES = '/teachers'

const path = (root, item) => `${root}${item}`;

export const profesores = {
  id: 'teachers',
  type: NAV_TYPE_ROOT,
  path: '/teachers',
  title: 'Control de Profesores',
  Icon: GraduationCap,
  childs: [
    {
      id: 'teachers.addNew',
      path: path(ROOT_PROFESORES, '/register'),
      type: NAV_TYPE_ITEM,
      title: 'Nuevo Profesor',
      Icon: GraduationCap,
    },
    // {
    //   id: 'teachers.allTeachers',
    //   path: path(ROOT_PROFESORES, '/all-teachers'),
    //   type: NAV_TYPE_ITEM,
    //   title: 'Profesores',
    //   Icon: GraduationCap,
    // }
  ]
}
