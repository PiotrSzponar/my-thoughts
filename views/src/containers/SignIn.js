import React, { useState, useContext } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
  MDBModalFooter
} from 'mdbreact';

import { signinService } from '../services/auth.service';
import { authSocialService } from '../services/auth.service';

import MyContext from '../hooks/myContext';

import ButtonFacebook from '../components/Buttons/ButtonFacebook.js';
import ButtonGoogle from '../components/Buttons/ButtonGoogle';

const SignIn = props => {
  const { setAuth, setUserData } = useContext(MyContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setLoading] = useState('');

  const submitLogin = async e => {
    // prevent from default form action
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    // add class to targeted form which validate fields
    e.target.className += ' was-validated';

    // service signin
    const result = await signinService({
      email,
      password
    });

    setLoading(false);

    // if message exists it means there was an error
    if (result.message) {
      setErrorMessage(result.message);
    } else {
      setAuth(true);
      setUserData(result.user);
      props.history.push(result.path);
    }
  };

  // onClick if facebook response success gets callback with accessToken
  const responseFacebook = async response => {
    // service that signin/up user in database
    const result = await authSocialService('facebook', response.accessToken);

    if (result.authorized) {
      setAuth(true);
      setUserData(result.user);
      props.history.push(result.path);
    } else {
      setErrorMessage('Something went wrong');
    }
  };

  // onClick if google response success gets callback with accessToken
  const responseGoogle = async response => {
    const result = await authSocialService('google', response.accessToken);

    if (result.authorized) {
      setAuth(true);
      setUserData(result.user);
      props.history.push(result.path);
    } else {
      setErrorMessage('Something went wrong');
    }
  };

  return (
    <MDBContainer>
      <MDBRow center>
        <MDBCol md="6">
          <MDBCard>
            <MDBCardBody className="mx-4">
              <div className="text-center">
                <h3 className="dark-grey-text mb-5">
                  <strong>Sign in</strong>
                </h3>
                <h5 className="dark-grey-text mb-5">
                  <strong>{errorMessage}</strong>
                </h5>
              </div>
              <form
                className="needs-validation"
                onSubmit={submitLogin}
                noValidate
              >
                <MDBInput
                  label="Your email*"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  id="defaultFormRegisterConfirmEx3"
                  className="form-control"
                  required
                />
                <MDBInput
                  label="Your password*"
                  name="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  containerClass="mb-0"
                  className="form-control"
                  required
                />
                <p className="font-small blue-text d-flex justify-content-end pb-3">
                  Forgot
                  <a href="/forgot-password" className="blue-text ml-1">
                    Password?
                  </a>
                </p>
                <div className="text-center mb-3">
                  <MDBBtn
                    type="submit"
                    gradient="blue"
                    rounded
                    className="btn-block z-depth-1a"
                  >
                    {isLoading ? 'Loading...' : 'Sign in'}
                  </MDBBtn>
                </div>
              </form>

              <p className="font-small dark-grey-text text-right d-flex justify-content-center mb-3 pt-2">
                or Sign in with:
              </p>
              <div className="row my-3 d-flex justify-content-center">
                <ButtonFacebook responseFacebook={responseFacebook} />
                <ButtonGoogle responseGoogle={responseGoogle} />
              </div>
            </MDBCardBody>
            <MDBModalFooter className="mx-5 pt-3 mb-1">
              <p className="font-small grey-text d-flex justify-content-end">
                Not a member?
                <a href="/signup" className="blue-text ml-1">
                  Sign Up
                </a>
              </p>
            </MDBModalFooter>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default SignIn;
