import React, { useState } from 'react';

import { MDBCardBody, MDBInput, MDBBtn } from 'mdbreact';

import Jumbotron from '../Jumbotron';
import { sendVerifyService } from '../../services/user.service';

const ResendVerification = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const submitResendVerification = async e => {
    e.preventDefault();
    setMessage('');

    const resp = await sendVerifyService({ email });

    setMessage(resp);
  };

  return (
    <Jumbotron>
      <MDBCardBody className="mx-4">
        {!message ? (
          <form
            className="needs-validation"
            onSubmit={submitResendVerification}
            noValidate
          >
            <MDBInput
              label="Your email"
              group
              type="email"
              onChange={e => setEmail(e.target.value)}
              validate
              error="wrong"
              success="right"
            />
            <MDBBtn type="submit" color="white" rounded className="z-depth-1a">
              Submit
            </MDBBtn>
          </form>
        ) : (
          message
        )}
      </MDBCardBody>
    </Jumbotron>
  );
};

export default ResendVerification;
