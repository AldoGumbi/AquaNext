// navigation/controlClases.js
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';
import {GraduationCap } from 'lucide-react';

const ROOT_CONTROL_CLASES = '/control-clases';

const path = (root, item) => `${root}${item}`;

export const controlClases = {
  id: 'control-clases',
  type: NAV_TYPE_ROOT,
  path: ROOT_CONTROL_CLASES,
  title: 'Control de Clases',
  Icon: GraduationCap,
  childs: [
    {
      id: 'control-clases.addNewGroup',
      path: path(ROOT_CONTROL_CLASES, '/register-group'),
      type: NAV_TYPE_ITEM,
      title: 'Nuevo Grupo',
      Icon: GraduationCap,
    },
    {
      id: 'control-clases.allGroups',
      path: path(ROOT_CONTROL_CLASES, '/all-groups'),
      type: NAV_TYPE_ITEM,
      title: 'Grupos',
      Icon: GraduationCap,
    },
    {
      id: 'control-clases.addNewTeacher',
      path: path(ROOT_CONTROL_CLASES, '/register-teacher'),
      type: NAV_TYPE_ITEM,
      title: 'Nuevo Profesor',
      Icon: GraduationCap,
    },
    {
      id: 'control-clases.allTeachers',
      path: path(ROOT_CONTROL_CLASES, '/all-teachers'),
      type: NAV_TYPE_ITEM,
      title: 'Profesores',
      Icon: GraduationCap,
    },
  ],
};
