import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

import './App.css';
import Navigation from './components/Navigation';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';

function App() {
  return (
    <Router>
      <Navigation />
      <Route path="/" exact component={SignIn} />

      <Route path="/signIn" component={SignIn} />
      <Route path="/signUp" component={SignUp} />
    </Router>
  );
}

export default App;
