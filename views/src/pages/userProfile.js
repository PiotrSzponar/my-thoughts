import React, { useContext } from 'react';

import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

// import { fetchUserService } from '../services/user.service';

import MyContext from '../hooks/myContext';

const UserProfile = ({ user }) => {
  const { userData } = useContext(MyContext);

  return (
    <MDBContainer>
      <MDBRow>
        <MDBCol md="8">
          <h1>My posts</h1>
        </MDBCol>
        <MDBCol md="4">
          <h1>{user.name}</h1>
          <p>email: {user.email}</p>
          <p>bio: {user.bio}</p>
          <p>city: {user.city}</p>
          <p>country: {user.country}</p>
          <p>gender: {user.gender}</p>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default UserProfile;
