import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

import './App.css';
import Navigation from './components/Navigation';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import CompleteSignUp from './components/Auth/CompleteSignup';
import Verification from './components/Auth/Verification';
import ResendVerification from './components/Auth/ResendVerification';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

function App() {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route path="/" exact component={SignIn} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route path="/complete-signup" component={CompleteSignUp} />
        <Route path="/resend-verification" component={ResendVerification} />
        <Route path="/verification/:id" component={Verification} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password/:id" component={ResetPassword} />
      </Switch>
    </Router>
  );
}

export default App;
