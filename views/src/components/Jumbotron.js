import React, { useState, useEffect } from 'react';
import {
  MDBJumbotron,
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCardTitle,
  MDBIcon
} from 'mdbreact';

const Jumbotron = ({ children }) => {
  return (
    <MDBContainer>
      <MDBRow>
        <MDBCol>
          <MDBJumbotron style={{ padding: 0, background: 'black' }}>
            <MDBCol className="text-white text-center py-5 px-4 my-5">
              <MDBCol className="py-5">
                {children}
                <MDBBtn outline color="white" className="mb-5">
                  <MDBIcon icon="angle-double-left" className="mr-2"></MDBIcon>
                  <a href="/" className="white-text ml-1">
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

export default Jumbotron;
