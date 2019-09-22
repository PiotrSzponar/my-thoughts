export const completeUserService = async body => {
  try {
    const response = await fetch(`/api/users/signup/complete`, {
      method: 'PATCH',
      headers: {
        'x-access-token': localStorage.getItem('token')
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

    result.user = data.user;
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchUserService = async () => {
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem('token')
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
