import React, { useState } from 'react';

import { MDBCardBody, MDBCardTitle } from 'mdbreact';

import Jumbotron from '../components/Jumbotron';
import EmailForm from '../components/EmailForm';
import { sendEmailToForgotPasswordService } from '../services/auth.service';

const ResendVerification = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setLoading] = useState(false);

  const submitForgotPassword = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const resp = await sendEmailToForgotPasswordService({ email });

    setMessage(resp);
    setLoading(false);
  };

  return (
    <Jumbotron>
      <MDBCardTitle className="h1-responsive pt-3 m-5 font-bold">
        Forgot Password?
      </MDBCardTitle>
      <MDBCardBody className="mx-4">
        {!message ? (
          <EmailForm
            handleSubmit={submitForgotPassword}
            setEmail={setEmail}
            isLoading={isLoading}
          />
        ) : (
          message
        )}
      </MDBCardBody>
    </Jumbotron>
  );
};

export default ResendVerification;
