// const apiUrl = 'http://localhost:3000/';

// const header = {
//   'Content-Type': 'application/json',
//   'Access-Control-Allow-Origin': '*'
// };

// export const LogInService = async body => {
//   try {
//     const response = await fetch(`${apiUrl}api/users/signin`, {
//       method: 'POST',
//       headers: header,
//       body: JSON.stringify(body)
//     });
//     const data = await response.json();

//     if (data.status !== 'ok') {
//       return data.error.errors;
//     }

//     return data;
//   } catch (error) {
//     return error;
//   }
// };

// export default {
//   logInService
// };
