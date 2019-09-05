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
    const { status, message, data } = await response.json();

    if (status !== 'ok') throw new Error(message);

    return message;
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
    const data = await response.json();

    console.log('verify', data);
    if (data.status !== 'ok') throw new Error(data.message);

    return data;
  } catch (error) {
    return error.message;
  }
};

export const sendVerifyService = async body => {
  try {
    const response = await fetch(`${apiUrl}api/users/resend-verification`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (data.status !== 'ok') throw new Error(data.message);

    return data;
  } catch (error) {
    return error.message;
  }
};
export default { SignUpService, verifyService, sendVerifyService };
