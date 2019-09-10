const apiUrl = 'http://localhost:3000/';

const header = {
  origin: apiUrl,
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

export const SignUpLocalService = async body => {
  try {
    const response = await fetch(`${apiUrl}api/users/signup`, {
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

export const SignUpGoogleService = async token => {
  try {
    const options = {
      method: 'POST',
      headers: header,
      body: JSON.stringify({ access_token: token })
    };

    const response = await fetch(`${apiUrl}api/users/signup/google`, options);

    const googleToken = await response.headers.get('x-auth-token');

    const user = await response.json();

    return { token: googleToken, user };
  } catch (error) {
    return error;
  }
};

export const SignUpFacebookService = async () => {
  try {
    const response = await fetch(`${apiUrl}api/users/signup/facebook`, {
      method: 'POST',
      headers: header
    });
    const data = await response.json();

    return data;
  } catch (error) {
    return error;
  }
};

export const verifyService = async id => {
  try {
    const response = await fetch(`${apiUrl}api/users/verification/${id}`, {
      method: 'PATCH',
      headers: header
    });
    const { status, message } = await response.json();

    if (status !== 'ok') throw new Error(message);

    return message;
  } catch (error) {
    return error.message;
  }
};

export const ResetPasswordService = async (id, body) => {
  try {
    const response = await fetch(`${apiUrl}api/users/reset-password/${id}`, {
      method: 'PATCH',
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

export const sendEmailToVerifyService = async body => {
  try {
    const response = await fetch(`${apiUrl}api/users/resend-verification`, {
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

export const sendEmailToForgotPasswordService = async body => {
  try {
    const response = await fetch(`${apiUrl}api/users/forgot-password`, {
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

export default {
  SignUpLocalService,
  verifyService,
  sendEmailToVerifyService,
  sendEmailToForgotPasswordService
};
