import React, { useState, useContext } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn
} from 'mdbreact';
import DatePicker from 'react-datepicker';

import { completeUserService } from '../services/user.service';

import MyContext from '../hooks/myContext';

const CompleteSignup = props => {
  const { setUserData } = useContext(MyContext);

  const [birthDate, setBirthDate] = useState(new Date());
  const [gender, setGender] = useState('female');

  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [photo, setPhoto] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const submitCompleteSignup = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const result = await completeUserService({
      birthDate: birthDate.toISOString().substring(0, 10),
      bio,
      city,
      country,
      photo,
      gender
    });

    setLoading(false);
    if (!result.message) {
      setUserData(result.user);
      props.history.push(result.path);
    } else {
      setMessage(result.message);
    }
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
                onSubmit={submitCompleteSignup}
                noValidate
              >
                <label className="grey-text">Birth date</label>
                <br />
                <DatePicker
                  dateFormat="yyyy-MM-dd"
                  selected={birthDate}
                  onChange={date => setBirthDate(date)}
                  required
                />
                <br />
                <label className="grey-text">gender</label>
                <br />
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="custom-select"
                >
                  <option value="female">female</option>
                  <option value="male">male</option>
                </select>
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
                    {isLoading ? 'Loading...' : 'Complete'}
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
