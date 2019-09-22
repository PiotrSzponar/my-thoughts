import React from 'react';
import { GoogleLogin } from 'react-google-login';

import { MDBBtn, MDBIcon } from 'mdbreact';

import config from '../../config/config.json';

const ButtonFacebook = ({ onSocialResponse }) => {
  return (
    <GoogleLogin
      clientId={config.GOOGLE_CLIENT_ID}
      onSuccess={resp => onSocialResponse(resp, 'google')}
      onFailure={resp => onSocialResponse(resp, 'google')}
      render={renderProps => (
        <MDBBtn
          onClick={renderProps.onClick}
          color="white"
          className="mb-3"
          type="submit"
        >
          <MDBIcon fab icon="google-plus-g" className="blue-text text-center" />
        </MDBBtn>
      )}
    />
  );
};

export default ButtonFacebook;
