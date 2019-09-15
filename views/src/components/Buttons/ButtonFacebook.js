import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import { MDBBtn, MDBIcon } from 'mdbreact';

import config from '../../config/config.json';

const ButtonFacebook = ({ responseFacebook }) => {
  return (
    <FacebookLogin
      appId={config.FACEBOOK_APP_ID}
      autoLoad={false}
      fields="name,email,picture"
      callback={responseFacebook}
      render={renderProps => (
        <MDBBtn
          onClick={renderProps.onClick}
          color="white"
          className="mb-3"
          type="submit"
        >
          <MDBIcon fab icon="facebook-f" className="blue-text text-center" />
        </MDBBtn>
      )}
    />
  );
};

export default ButtonFacebook;
