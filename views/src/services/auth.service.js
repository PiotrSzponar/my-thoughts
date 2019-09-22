//TODO: add check if token is expired

export const authLocalService = async body => {
  try {
    const response = await fetch(`/api/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return await response.json();
  } catch (error) {
    return error;
  }
};

export const signinService = async body => {
  try {
    const response = await fetch(`/api/users/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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

    localStorage.setItem('token', newtoken);
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ access_token: token })
    };

    const response = await fetch(`/api/users/signup/${type}`, options);

    const newtoken = await response.headers.get('x-auth-token');

    const { data, status, error } = await response.json();

    let result = {
      path: '/',
      authorized: false,
      user: {},
      error: ''
    };

    if (status === 'fail') {
      result.error = error.message;
      return result;
    }

    if (token) {
      localStorage.setItem('token', newtoken);
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
    const response = await fetch(`/api/users/verification/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
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
    const response = await fetch(`/api/users/reset-password/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
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
    const response = await fetch(`/api/users/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
    const response = await fetch(`/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const { status, message } = await response.json();
    if (status !== 'ok') throw new Error(message);

    return message;
  } catch (error) {
    return error.message;
  }
};
