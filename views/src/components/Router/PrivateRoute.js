import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';

import MyContext from '../../hooks/myContext';

import { getSession } from '../../services/session.service';
// import { fetchUserService } from '../services/user.service';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, setUserData } = useContext(MyContext);

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
