import React from 'react';
import {
  MDBJumbotron,
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCardTitle,
  MDBIcon
} from 'mdbreact';

const JumbotronPage = () => {
  return (
    <MDBContainer>
      <MDBRow>
        <MDBCol>
          <MDBJumbotron style={{ padding: 0 }}>
            <MDBCol
              className="text-white text-center py-5 px-4 my-5"
              style={{
                backgroundImage: `./verification.jpeg`
              }}
            >
              <MDBCol className="py-5">
                <MDBCardTitle className="h1-responsive pt-3 m-5 font-bold">
                  Verification
                </MDBCardTitle>
                <p className="mx-5 mb-5">
                  Hurra! You are now a member of our Family Welcome to My
                  Thoughts!
                </p>
                <MDBBtn outline color="white" className="mb-5">
                  <MDBIcon icon="angle-double-left" className="mr-2"></MDBIcon>
                  <a href="/signin" className="white-text ml-1">
                    Go To Home Page
                  </a>
                </MDBBtn>
              </MDBCol>
            </MDBCol>
          </MDBJumbotron>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default JumbotronPage;
