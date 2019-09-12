import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import MyContext from './hooks/myContext';

// import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

import './App.css';
import PrivateRoute from './components/Router/PrivateRoute';
import Navigation from './components/Navigation';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import CompleteSignup from './components/Auth/CompleteSignup';
import Verification from './components/Auth/Verification';
import ResendVerification from './components/Auth/ResendVerification';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

import Dashboard from './pages/dashboard';
import Posts from './pages/posts';
import userProfile from './pages/userProfile';

function App() {
  const [isLoggedIn, setAuth] = useState(false);

  return (
    <MyContext.Provider value={{ isLoggedIn, setAuth }}>
      <Router>
        <Navigation />
        <Switch>
          <Route
            path="/"
            exact
            render={props =>
              isLoggedIn ? <Dashboard {...props} /> : <SignIn {...props} />
            }
          />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <PrivateRoute path="/complete-signup" component={CompleteSignup} />
          <Route path="/resend-verification" component={ResendVerification} />
          <Route path="/verification/:id" component={Verification} />
          <PrivateRoute path="/posts" component={Posts} />
          <PrivateRoute path="/user/:id" component={userProfile} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password/:id" component={ResetPassword} />
        </Switch>
      </Router>
    </MyContext.Provider>
  );
}

export default App;
