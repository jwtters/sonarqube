/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as api from '../../../../api/permissions';
import { parseError } from '../../../code/utils';
import { raiseError } from '../../shared/store/actions';
import {
    getQuery,
    getFilter,
    getSelectedPermission
} from '../../shared/store/rootReducer';

export const loadHolders = projectKey => (dispatch, getState) => {
  const query = getQuery(getState());
  const filter = getFilter(getState());
  const selectedPermission = getSelectedPermission(getState());

  dispatch({ type: 'REQUEST_HOLDERS', query });

  const requests = [];

  if (filter !== 'groups') {
    requests.push(api.getPermissionsUsersForComponent(projectKey, query,
        selectedPermission));
  } else {
    requests.push(Promise.resolve([]));
  }

  if (filter !== 'users') {
    requests.push(api.getPermissionsGroupsForComponent(projectKey, query,
        selectedPermission));
  } else {
    requests.push(Promise.resolve([]));
  }

  return Promise.all(requests).then(responses => (
      dispatch({
        type: 'RECEIVE_HOLDERS_SUCCESS',
        users: responses[0],
        groups: responses[1],
        query
      })
  )).catch(e => {
    return parseError(e).then(message => dispatch(raiseError(message)));
  });
};

export const updateQuery = (projectKey, query = '') => dispatch => {
  dispatch({ type: 'UPDATE_QUERY', query });
  if (query.length === 0 || query.length > 2) {
    dispatch(loadHolders(projectKey));
  }
};

export const updateFilter = (projectKey, filter) => dispatch => {
  dispatch({ type: 'UPDATE_FILTER', filter });
  dispatch(loadHolders(projectKey));
};

export const selectPermission = (projectKey, permission) => (dispatch, getState) => {
  const selectedPermission = getSelectedPermission(getState());
  if (selectedPermission !== permission) {
    dispatch({ type: 'SELECT_PERMISSION', permission });
  } else {
    dispatch({ type: 'SELECT_PERMISSION', permission: null });
  }
  dispatch(loadHolders(projectKey));
};

export const grantToUser = (projectKey, login, permission) => dispatch => {
  api.grantPermissionToUser(projectKey, login, permission).then(() => {
    dispatch({ type: 'GRANT_PERMISSION_TO_USER', login, permission });
  }).catch(e => {
    return parseError(e).then(message => dispatch(raiseError(message)));
  });
};

export const revokeFromUser = (projectKey, login, permission) => dispatch => {
  api.revokePermissionFromUser(projectKey, login, permission).then(() => {
    dispatch({ type: 'REVOKE_PERMISSION_TO_USER', login, permission });
  }).catch(e => {
    return parseError(e).then(message => dispatch(raiseError(message)));
  });
};

export const grantToGroup = (projectKey, groupName, permission) => dispatch => {
  api.grantPermissionToGroup(projectKey, groupName, permission).then(() => {
    dispatch({
      type: 'GRANT_PERMISSION_TO_GROUP',
      groupName,
      permission
    });
  }).catch(e => {
    return parseError(e).then(message => dispatch(raiseError(message)));
  });
};

export const revokeFromGroup = (projectKey, groupName, permission) => dispatch => {
  api.revokePermissionFromGroup(projectKey, groupName, permission).then(() => {
    dispatch({
      type: 'REVOKE_PERMISSION_FROM_GROUP',
      groupName,
      permission
    });
  }).catch(e => {
    return parseError(e).then(message => dispatch(raiseError(message)));
  });
};
