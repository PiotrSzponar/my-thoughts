import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import MyContext from './hooks/myContext';

// import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

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
import userProfile from './pages/userProfile';

function App() {
  const [isLoggedIn, setAuth] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    (async () => {
      const authorized = await getSession('auth', 'user');
      setAuth(true);
      setUserData(authorized[1]);
    })();
  }, []);

  return (
    <MyContext.Provider value={{ isLoggedIn, setAuth }}>
      <Router>
        <Navigation />
        <Switch>
          <PrivateRoute path="/" exact component={Dashboard} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <PrivateRoute path="/complete-signup" component={CompleteSignup} />
          <Route path="/resend-verification" component={ResendVerification} />
          <Route path="/verification/:id" component={Verification} />
          <PrivateRoute path="/posts" component={Posts} />
          <PrivateRoute path="/user/:id" component={userProfile} />
          <PrivateRoute path="/me" component={userProfile} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password/:id" component={ResetPassword} />
        </Switch>
      </Router>
    </MyContext.Provider>
  );
}

export default App;
