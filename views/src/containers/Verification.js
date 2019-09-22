import React, { useState, useEffect } from 'react';

import { MDBCardTitle } from 'mdbreact';
import Jumbotron from '../components/Jumbotron';
import { verifyService } from '../services/auth.service';

const Verification = props => {
  const [message, setMessage] = useState('Wait for it!');

  const verficiateUrl = async () => {
    const verificationId = props.match.params.id;

    const resp = await verifyService(verificationId);

    setMessage(resp);
  };

  useEffect(() => {
    verficiateUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Jumbotron>
      <MDBCardTitle className="h1-responsive pt-3 m-5 font-bold">
        Verificiation
      </MDBCardTitle>
      <p className="white-text mx-5 mb-5">{message}</p>
    </Jumbotron>
  );
};

export default Verification;
