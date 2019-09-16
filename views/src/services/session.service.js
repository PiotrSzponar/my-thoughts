export const setSession = async obj => {
  await Object.keys(obj).forEach(key => {
    localStorage.setItem(key, JSON.stringify(obj[key]));
  });
};

export const getSession = (...items) => {
  const data = [];
  items.forEach(key => {
    if (localStorage.getItem(key) !== null)
      data.push(JSON.parse(localStorage.getItem(key)));
  });
  return data;
};

export const clearSession = async (...items) => {
  await items.forEach(key => {
    localStorage.clear(key);
  });
};
