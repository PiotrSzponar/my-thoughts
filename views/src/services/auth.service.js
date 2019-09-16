import { setSession } from './session.service';
import config from '../config/config.json';

const header = {
  origin: config.API_URL,
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

export const authLocalService = async body => {
  try {
    const response = await fetch(`${config.API_URL}api/users/signup`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return data;
  } catch (error) {
    return error;
  }
};

export const signinService = async body => {
  try {
    const response = await fetch(`${config.API_URL}api/users/signin`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    });
    const { data, status, error } = await response.json();

    const newtoken = await response.headers.get('x-auth-token');

    const result = {
      path: '/',
      authorized: false,
      user: {},
      message: ''
    };

    if (status === 'fail') {
      result.message = error.message;
      return result;
    }

    if (data.user && !data.user.isCompleted) {
      result.path = '/complete-signup';
    }

    await setSession({ auth: true, user: data.user, token: newtoken });
    result.authorized = true;
    result.user = data.user;
    return result;
  } catch (error) {
    return error;
  }
};

export const authSocialService = async (type, token) => {
  try {
    const options = {
      method: 'POST',
      headers: header,
      body: JSON.stringify({ access_token: token })
    };

    const response = await fetch(
      `${config.API_URL}api/users/signup/${type}`,
      options
    );

    const newtoken = await response.headers.get('x-auth-token');

    const { data, status, error } = await response.json();

    let result = {
      path: '/',
      authorized: false,
      user: {}
    };

    if (status === 'fail') {
      result.message = error.message;
      return;
    }

    if (token) {
      await setSession({ auth: true, user: data.user, token: newtoken });
      result.authorized = true;
      result.user = data.user;

      if (data.user && !data.user.isCompleted) {
        result.path = '/complete-signup';
      }
      return result;
    }

    return result;
  } catch (error) {
    return error;
  }
};

export const verifyService = async id => {
  try {
    const response = await fetch(
      `${config.API_URL}api/users/verification/${id}`,
      {
        method: 'PATCH',
        headers: header
      }
    );
    const { status, message } = await response.json();

    if (status !== 'ok') throw new Error(message);

    return message;
  } catch (error) {
    return error.message;
  }
};

export const ResetPasswordService = async (id, body) => {
  try {
    const response = await fetch(
      `${config.API_URL}api/users/reset-password/${id}`,
      {
        method: 'PATCH',
        headers: header,
        body: JSON.stringify(body)
      }
    );
    const { status, message } = await response.json();

    if (status !== 'ok') throw new Error(message);

    return message;
  } catch (error) {
    return error.message;
  }
};

export const sendEmailToVerifyService = async body => {
  try {
    const response = await fetch(
      `${config.API_URL}api/users/resend-verification`,
      {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body)
      }
    );

    const { status, message } = await response.json();
    if (status !== 'ok') throw new Error(message);

    return message;
  } catch (error) {
    return error.message;
  }
};

export const sendEmailToForgotPasswordService = async body => {
  try {
    const response = await fetch(`${config.API_URL}api/users/forgot-password`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    });

    const { status, message } = await response.json();
    if (status !== 'ok') throw new Error(message);

    return message;
  } catch (error) {
    return error.message;
  }
};
