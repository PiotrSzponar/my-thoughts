import React, { useState, useContext } from 'react';

import MyContext from '../hooks/myContext';

import ButtonFacebook from '../components/Buttons/ButtonFacebook.js';
import ButtonGoogle from '../components/Buttons/ButtonGoogle';

import { authLocalService, authSocialService } from '../services/auth.service';
import { setSession } from '../services/session.service';

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

const SignUp = props => {
  const { setAuth } = useContext(MyContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const submitRegister = async e => {
    e.preventDefault();

    setMessage('');
    setErrorMessage('');
    setLoading(true);

    e.target.className += ' was-validated';

    if (password !== passwordConfirm) {
      setErrorMessage('Fields are not valid');
      setLoading(false);
      return;
    }

    const result = await authLocalService({
      name,
      email,
      password,
      passwordConfirm
    });

    setMessage(result.message);
    setLoading(false);
  };

  const responseFacebook = async response => {
    const result = await authSocialService('facebook', response.accessToken);

    if (result.authorized) {
      setAuth(true);
      props.history.push(result.path);
    } else {
      setMessage('Something went wrong');
    }
  };

  const responseGoogle = async response => {
    const result = await authSocialService('google', response.accessToken);

    if (result.authorized) {
      setAuth(true);
      props.history.push(result.path);
    } else {
      setMessage('Something went wrong');
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
                <h5 className="red-text mb-5">{errorMessage}</h5>
                <h5 className="green-text mb-5">{message}</h5>
              </div>
              <form
                className="needs-validation"
                onSubmit={submitRegister}
                noValidate
              >
                <MDBInput
                  label="name*"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-control"
                  required
                />
                <MDBInput
                  label="Your email*"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                <MDBInput
                  label="Confirm your password"
                  name="passwordConfirm"
                  group
                  type="password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  containerClass="mb-0"
                  className="form-control"
                  required
                />
                <div className="text-center mb-3 mt-5">
                  <MDBBtn
                    type="submit"
                    gradient="blue"
                    rounded
                    className="btn-block z-depth-1a"
                  >
                    {isLoading ? 'Loading...' : 'Sign up'}
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

export default SignUp;
