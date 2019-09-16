import config from '../config/config.json';
import { getSession, setSession } from './session.service';

export const completeUserService = async body => {
  try {
    const response = await fetch(`${config.API_URL}api/users/signup/complete`, {
      method: 'PATCH',
      headers: {
        origin: config.API_URL,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'x-access-token': getSession('token')
      },
      body: JSON.stringify(body)
    });

    const { status, error, data } = await response.json();

    const result = {
      path: '/',
      message: '',
      user: {}
    };

    if (status === 'fail') {
      result.message = error.message;
      return result;
    }
    await setSession({ user: data.user });
    result.user = data.user;
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchUserService = async () => {
  try {
    const response = await fetch(`${config.API_URL}api/users/me`, {
      method: 'GET',
      headers: {
        origin: config.API_URL,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'x-access-token': getSession('token')
      }
    });

    const { status, data, error } = await response.json();
    if (status === 'fail') {
      return error.message;
    }

    return data.user;
  } catch (error) {
    console.log(error);
  }
};
