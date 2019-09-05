import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
  MDBIcon,
  MDBModalFooter
} from 'mdbreact';

const SignUp = props => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');

  const [toCompleteSignup, setCompleteSignup] = useState(false);

  const submitRegister = e => {
    e.preventDefault();
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('passwordCheck', passwordCheck);

    if (password === passwordCheck) {
      setCompleteSignup(true);
    }
  };

  useEffect(() => {
    if (toCompleteSignup) {
      props.history.push('/complete-signup');
    }
  });

  return (
    <MDBContainer>
      <MDBRow center>
        <MDBCol md="6">
          <MDBCard>
            <MDBCardBody className="mx-4">
              <div className="text-center">
                <h5 className="dark-grey-text mb-6">
                  <strong>Step 1</strong>
                </h5>
                <h3 className="dark-grey-text mb-5">
                  <strong>Sign Up</strong>
                </h3>
              </div>
              <form
                className="needs-validation"
                onSubmit={submitRegister}
                noValidate
              >
                <MDBInput
                  label="Your email"
                  name="email"
                  group
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error="wrong"
                  success="right"
                  required
                />
                <MDBInput
                  label="Your password"
                  name="password"
                  group
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  containerClass="mb-0"
                  required
                />
                <MDBInput
                  label="Confirm your password"
                  name="passwordCheck"
                  group
                  type="password"
                  value={passwordCheck}
                  onChange={e => setPasswordCheck(e.target.value)}
                  containerClass="mb-0"
                  required
                />
                <div className="text-center mb-3">
                  <MDBBtn
                    type="submit"
                    gradient="blue"
                    rounded
                    className="btn-block z-depth-1a"
                  >
                    Sign Up
                  </MDBBtn>
                </div>
              </form>
              <p className="font-small dark-grey-text text-right d-flex justify-content-center mb-3 pt-2">
                or Sign in with:
              </p>
              <div className="row my-3 d-flex justify-content-center">
                <MDBBtn
                  type="button"
                  color="white"
                  rounded
                  className="mr-md-3 z-depth-1a"
                >
                  <MDBIcon
                    fab
                    icon="facebook-f"
                    className="blue-text text-center"
                  />
                </MDBBtn>
                <MDBBtn
                  type="button"
                  color="white"
                  rounded
                  className="z-depth-1a"
                >
                  <MDBIcon fab icon="google-plus-g" className="blue-text" />
                </MDBBtn>
              </div>
            </MDBCardBody>
            <MDBModalFooter className="mx-5 pt-3 mb-1">
              <p className="font-small grey-text d-flex justify-content-end">
                already a member?
                <a href="/signin" className="blue-text ml-1">
                  Sign In
                </a>
              </p>
            </MDBModalFooter>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default withRouter(SignUp);
