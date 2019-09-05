import React, { useState, useEffect } from 'react';

import Jumbotron from '../Jumbotron';
import { verifyService } from '../../services/user.service';

const Verification = props => {
  const [message, setMessage] = useState('Wait for it!');

  const verficiateUrl = async () => {
    const verificationId = props.match.params.id;

    const resp = await verifyService(verificationId);

    setMessage(resp);
  };

  useEffect(() => {
    verficiateUrl();
  });

  return (
    <Jumbotron>
      <p className="mx-5 mb-5">{message}</p>
    </Jumbotron>
  );
};

export default Verification;
