import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

import FacebookLogin from 'react-facebook-login';

import { GoogleLogin } from 'react-google-login';

import config from '../../config/config.json';

import {
  SignUpLocalService,
  SignUpSocialService
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

const SignUp = props => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

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

  const responseFacebook = async response => {
    console.log(response.accessToken);
    const { user, token } = await SignUpSocialService(
      'facebook',
      response.accessToken
    );
    console.log(user, token);
  };
  const responseGoogle = async response => {
    const { user, token } = await SignUpSocialService(
      'google',
      response.accessToken
    );

    if (token) {
      localStorage.setItem('user', user);
      localStorage.setItem('token', token);
      localStorage.setItem('auth', true);

      if (user && !user.isCompleted) props.history.push('/complete-signup');
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
                <FacebookLogin
                  appId={config.FACEBOOK_APP_ID}
                  autoLoad={false}
                  fields="name,email,picture"
                  callback={responseFacebook}
                />
                <GoogleLogin
                  clientId={config.GOOGLE_CLIENT_ID}
                  buttonText="Login"
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                />
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
