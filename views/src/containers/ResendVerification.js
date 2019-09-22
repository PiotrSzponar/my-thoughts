import React, { useState } from 'react';

import { MDBCardBody, MDBCardTitle } from 'mdbreact';

import Jumbotron from '../components/Jumbotron';
import EmailForm from '../components/EmailForm';
import { sendEmailToVerifyService } from '../services/auth.service';

const ResendVerification = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setLoading] = useState(false);

  const submitResendVerification = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const resp = await sendEmailToVerifyService({ email });

    setMessage(resp);
    setLoading(false);
  };

  return (
    <Jumbotron>
      <MDBCardTitle className="h1-responsive pt-3 m-5 font-bold">
        Verificiation
      </MDBCardTitle>
      <MDBCardBody className="mx-4">
        {!message ? (
          <EmailForm
            handleSubmit={submitResendVerification}
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
