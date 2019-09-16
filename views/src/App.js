import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import MyContext from './hooks/myContext';

import './App.css';
import PrivateRoute from './components/Router/PrivateRoute';
import Navigation from './components/Navigation';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import CompleteSignup from './auth/CompleteSignup';
import Verification from './auth/Verification';
import ResendVerification from './auth/ResendVerification';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';

import { getSession } from './services/session.service';

import Dashboard from './pages/dashboard';
import Posts from './pages/posts';
import UserProfile from './pages/userProfile';
import NotFound from './pages/notFound';

function App() {
  const [isLoggedIn, setAuth] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    (async () => {
      const authorized = await getSession('auth', 'user');
      if (authorized[0]) {
        setAuth(true);
        setUserData(authorized[1]);
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
