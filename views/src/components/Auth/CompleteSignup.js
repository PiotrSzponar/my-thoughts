import React, { useState } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn
} from 'mdbreact';

import { SignUpService } from '../../services/user.service';

const CompleteSignup = props => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('female');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [photo, setPhoto] = useState('');

  const [message, setMessage] = useState('');

  const submitHandler = async e => {
    e.preventDefault();
    setMessage('');
    const result = await SignUpService({
      name,
      email: localStorage.getItem('email'),
      password: localStorage.getItem('password'),
      passwordConfirm: localStorage.getItem('passwordCheck'),
      method: 'local',
      birthDate,
      bio,
      city,
      country,
      photo,
      gender
    });
    setMessage(result.message);
  };

  return (
    <MDBContainer>
      <MDBRow center>
        <MDBCol md="6">
          <MDBCard>
            <MDBCardBody className="mx-4">
              <div className="text-center">
                <h5 className="dark-grey-text mb-6">
                  <strong>Step 2</strong>
                </h5>
                <h3 className="dark-grey-text mb-5">
                  <strong>Complete Signup</strong>
                </h3>
              </div>
              {message}
              <form
                className="needs-validation"
                onSubmit={submitHandler}
                noValidate
              >
                <MDBInput
                  label="name*"
                  group
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  error="wrong"
                  success="right"
                  required
                />
                <MDBInput
                  label="Birth Date*"
                  group
                  type="text"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  error="wrong"
                  success="right"
                  required
                />
                <MDBInput
                  label="female"
                  group
                  type="radio"
                  value="female"
                  checked={gender === 'female'}
                  onClick={e => setGender(e.target.value)}
                />
                <MDBInput
                  label="male"
                  group
                  type="radio"
                  value="male"
                  checked={gender === 'male'}
                  onClick={e => setGender(e.target.value)}
                />
                <MDBInput
                  label="Your bio"
                  group
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  containerClass="mb-0"
                />

                <MDBInput
                  label="Your city"
                  group
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  containerClass="mb-0"
                />

                <MDBInput
                  label="Your country"
                  group
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  containerClass="mb-0"
                />

                <MDBInput
                  label="Your Photo"
                  group
                  type="text"
                  value={photo}
                  onChange={e => setPhoto(e.target.value)}
                  containerClass="mb-0"
                />

                <div className="text-center mb-3">
                  <MDBBtn
                    type="submit"
                    gradient="blue"
                    rounded
                    className="btn-block z-depth-1a"
                  >
                    Enter
                  </MDBBtn>
                </div>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default CompleteSignup;
