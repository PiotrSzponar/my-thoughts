import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import MyContext from './hooks/myContext';

import './App.css';
import PrivateRoute from './Router/PrivateRoute';
import Navigation from './components/Navigation';
import SignIn from './containers/SignIn';
import SignUp from './containers/SignUp';
import CompleteSignup from './containers/CompleteSignup';
import Verification from './containers/Verification';
import ResendVerification from './containers/ResendVerification';
import ForgotPassword from './containers/ForgotPassword';
import ResetPassword from './containers/ResetPassword';

import Dashboard from './containers/dashboard';
import Posts from './containers/posts';
import UserProfile from './containers/userProfile';
import NotFound from './containers/notFound';

function App() {
  const [isLoggedIn, setAuth] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    (() => {
      const token = localStorage.getItem('token');

      if (token) {
        setAuth(true);
      } else {
        setAuth(false);
      }
    })();
  }, []);

  return (
    <MyContext.Provider value={{ isLoggedIn, setAuth, userData, setUserData }}>
      <Router>
        <Navigation user={userData} />
        <Switch>
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/verification/:id" component={Verification} />
          <Route path="/resend-verification" component={ResendVerification} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password/:id" component={ResetPassword} />

          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute path="/complete-signup" component={CompleteSignup} />
          <PrivateRoute path="/posts" component={Posts} />
          <PrivateRoute path="/me" component={UserProfile} />

          <Route component={NotFound} />
        </Switch>
      </Router>
    </MyContext.Provider>
  );
}

export default App;
