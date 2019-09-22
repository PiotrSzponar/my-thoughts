import React, { useContext } from 'react';

import MyContext from '../hooks/myContext';

import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

const UserProfile = ({ user }) => {
  const { userData } = useContext(MyContext);

  return (
    <MDBContainer>
      <MDBRow>
        <MDBCol md="8">
          <h1>My posts</h1>
        </MDBCol>
        <MDBCol md="4">
          <h1>{userData.name}</h1>
          <p>email: {userData.email}</p>
          <p>bio: {userData.bio}</p>
          <p>city: {userData.city}</p>
          <p>country: {userData.country}</p>
          <p>gender: {userData.gender}</p>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default UserProfile;
