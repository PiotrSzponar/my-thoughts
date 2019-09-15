import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';

import MyContext from '../../hooks/myContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn } = useContext(MyContext);

  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} />
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
