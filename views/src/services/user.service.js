import React from 'react';
import { id } from 'postcss-selector-parser';

const apiUrl = 'http://localhost:3000/';

const header = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

export const SignUpService = async body => {
  console.log(body);
  try {
    const response = await fetch(`${apiUrl}api/users/signup`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    });
    const { status, message } = await response.json();

    if (status !== 'ok') throw new Error(message);

    return { message, status };
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
  SignUpService,
  verifyService,
  sendEmailToVerifyService,
  sendEmailToForgotPasswordService
};
