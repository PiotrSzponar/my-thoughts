import React from 'react';

import { MDBInput, MDBBtn } from 'mdbreact';

const EmailForm = ({ handleSubmit, setEmail, isLoading }) => {
  return (
    <form className="needs-validation" onSubmit={handleSubmit} noValidate>
      <MDBInput
        label="Your email"
        group
        type="email"
        labelClass="white-text"
        onChange={e => setEmail(e.target.value)}
        validate
        error="wrong"
        success="right"
      />
      <MDBBtn type="submit" color="white" rounded className="z-depth-1a">
        {isLoading ? 'Loading...' : 'Submit'}
      </MDBBtn>
    </form>
  );
};

export default EmailForm;
