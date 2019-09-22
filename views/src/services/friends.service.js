export const fetchAllFriendsService = async () => {
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
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

export const fetchAddFriendService = async () => {
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
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
