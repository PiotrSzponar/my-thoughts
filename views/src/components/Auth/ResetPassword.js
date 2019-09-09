import React, { useState } from 'react';

import { MDBCardTitle, MDBCardBody, MDBInput, MDBBtn } from 'mdbreact';
import Jumbotron from '../Jumbotron';
import { ResetPasswordService } from '../../services/auth.service';

const Verification = props => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async e => {
    const verificationId = props.match.params.id;
    e.preventDefault();
    setIsLoading(false);

    if (password === passwordConfirm) {
      const resp = await ResetPasswordService(verificationId, {
        password,
        passwordConfirm: passwordConfirm
      });
      setMessage(resp);
    } else {
      setMessage('Wrong passwords');
    }
    setIsLoading(true);
  };

  return (
    <Jumbotron>
      <MDBCardTitle className="h1-responsive pt-3 m-5 font-bold">
        Reset Password
      </MDBCardTitle>
      <MDBCardBody className="mx-4">
        {!message ? (
          <form
            className="needs-validation"
            onSubmit={handleResetPassword}
            noValidate
          >
            <MDBInput
              label="Your password"
              name="password"
              group
              type="password"
              value={password}
              labelClass="white-text"
              onChange={e => setPassword(e.target.value)}
              containerClass="mb-0"
              required
            />
            <MDBInput
              label="Confirm your password"
              name="passwordConfirm"
              group
              type="password"
              value={passwordConfirm}
              labelClass="white-text"
              onChange={e => setPasswordConfirm(e.target.value)}
              containerClass="mb-0 white-text"
              required
            />
            <MDBBtn type="submit" color="white" rounded className="z-depth-1a">
              {isLoading ? 'Loading...' : 'Submit'}
            </MDBBtn>
          </form>
        ) : (
          message
        )}
      </MDBCardBody>
    </Jumbotron>
  );
};

export default Verification;
