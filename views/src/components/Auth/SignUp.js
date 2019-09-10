import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

import { GoogleLogin } from 'react-google-login';

import config from '../../config/config.json';

import {
  SignUpLocalService,
  SignUpGoogleService
} from '../../services/auth.service';

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

const GOOGLE_CLIENT_ID =
  '523448953860-3b301c7or56k5b7bfb373hj2vbf7q1fj.apps.googleusercontent.com';

const SignUp = props => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  // store in LocalStorage
  const [isAuthenticated, setAuthentication] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const submitRegister = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (password !== passwordConfirm) {
      setMessage('passwords dont match');
      setLoading(false);
      return;
    }

    const response = await SignUpLocalService({
      name,
      email,
      password,
      passwordConfirm
    });

    console.log(response);
    //  setMessage(message);
    setLoading(false);
  };
  console.log(isAuthenticated, user, token);

  const responseGoogle = async response => {
    const { user, token } = await SignUpGoogleService(response.accessToken);

    if (token) {
      setAuthentication(true);
      setUser(user);
      setToken(token);
    }
  };

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
                  <strong>Sign up</strong>
                </h3>
              </div>
              <form
                className="needs-validation"
                onSubmit={submitRegister}
                noValidate
              >
                <MDBInput
                  label="name*"
                  group
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  error="wrong"
                  success="right"
                  required
                />
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
                  name="passwordConfirmrm"
                  group
                  type="password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  containerClass="mb-0"
                  required
                />
                <div className="text-center mb-3 mt-5">
                  <MDBBtn
                    type="submit"
                    gradient="blue"
                    rounded
                    className="btn-block z-depth-1a"
                  >
                    {isLoading ? 'Loading...' : 'Signup'}
                  </MDBBtn>
                </div>
              </form>
              <p className="font-small dark-grey-text text-right d-flex justify-content-center mb-3 pt-2">
                or Sign up with:
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

                <GoogleLogin
                  clientId={config.GOOGLE_CLIENT_ID}
                  buttonText="Login"
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                />
                <MDBBtn
                  type="button"
                  color="white"
                  onClick={responseGoogle}
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
