import React from 'react';

const apiUrl = 'http://localhost:3000/';

export const SignUpService = async body => {
  console.log(body);
  try {
    const response = await fetch(`${apiUrl}api/users/signup`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(body)
    });
    const { status, message, data } = await response.json();
    console.log(status, message, data);
    // if (status !== 'ok') throw new Error(message);

    return data;
  } catch (error) {
    console.log(error);
  }
};

export default { SignUpService };
