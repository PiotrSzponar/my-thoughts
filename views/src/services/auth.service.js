const apiUrl = 'http://localhost:3000/';

const header = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  cors: 'no-cors'
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

export const SignUpGoogleService = async body => {
  try {
    const response = await fetch(`${apiUrl}api/users/signup/google`, {
      method: 'GET',
      headers: header
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    return error;
  }
};

export const SignUpFacebookService = async body => {
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
