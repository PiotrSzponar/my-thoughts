import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { getSession } from '../services/session.service';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const authorized = getSession('auth', 'user');

  return (
    <Route
      {...rest}
      render={props =>
        authorized[0] ? (
          <Component {...props} user={authorized[1]} />
        ) : (
          <Redirect
            to={{
              pathname: '/signin'
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
