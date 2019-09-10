import React from 'react';
import { Route, Redirect } from 'react-router-dom';
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem('auth') === true ? (
        // <Component {...props} />
        console.log('true')
      ) : (
        <Redirect
          to={{
            pathname: '/'
          }}
        />
      )
    }
  />
);

export default PrivateRoute;
