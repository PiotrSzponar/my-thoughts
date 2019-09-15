import config from '../config/config.json';
import { getSession } from './session.service';

const header = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

export const completeUserService = async body => {
  try {
    const response = await fetch(`${config.API_URL}api/users/signup/complete`, {
      method: 'PATCH',
      headers: {
        origin: config.API_URL,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'x-access-token': await getSession('token')
      },
      body: JSON.stringify(body)
    });

    const { status, error } = await response.json();

    const result = {
      path: '/',
      message: ''
    };

    if (status === 'fail') {
      result.message = error.message;
    }

    return result;
  } catch (error) {
    return error;
  }
};
