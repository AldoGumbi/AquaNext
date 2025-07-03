import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'


import { UsersRound } from 'lucide-react';
const ROOT_GROUPS = '/groups'

const path = (root, item) => `${root}${item}`;

export const groups = {
  id: 'groups',
  type: NAV_TYPE_ROOT,
  path: '/groups',
  title: 'Control de Grupos',
  Icon: UsersRound,
  childs: [
    {
      id: 'groups.addNew',
      path: path(ROOT_GROUPS, '/register'),
      type: NAV_TYPE_ITEM,
      title: 'Nuevo Grupo',
      Icon: UsersRound,
    },
    {
      id: 'groups.allGroups',
      path: path(ROOT_GROUPS, '/all-groups'),
      type: NAV_TYPE_ITEM,
      title: 'Grupos',
      Icon: UsersRound,
    }
  ]
}
