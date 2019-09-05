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

function App() {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route path="/" exact component={SignIn} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route path="/complete-signup" component={CompleteSignUp} />
        <Route
          path="/verification/:id"
          render={props => <Verification {...props} />}
        />
        <Route
          path="/resend-verification"
          render={props => <ResendVerification {...props} />}
        />
      </Switch>
    </Router>
  );
}

export default App;
