import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

import './App.css';
import Navigation from './components/Navigation';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import CompleteSignUp from './components/Auth/CompleteSignup';

function App() {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route path="/" exact component={SignIn} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route path="/complete-signup" component={CompleteSignUp} />
      </Switch>
    </Router>
  );
}

export default App;
