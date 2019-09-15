import React, { useState, useContext } from 'react';

import { clearSession } from '../services/session.service';

import MyContext from '../hooks/myContext';

import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavItem,
  MDBNavLink,
  MDBNavbarToggler,
  MDBCollapse
} from 'mdbreact';

const Navigation = props => {
  const { isLoggedIn, setAuth } = useContext(MyContext);

  const [isOpen, toggleIsOpen] = useState(false);

  const toggleCollapse = () => {
    toggleIsOpen(!isOpen);
  };

  const onLogout = async () => {
    await clearSession('auth', 'user', 'token');
    toggleIsOpen(!isOpen);
    setAuth(false);
  };

  return (
    <MDBNavbar
      className="light-blue darken-4 mb-4"
      color="indigo"
      dark
      expand="md"
    >
      <MDBNavbarBrand>
        <strong className="white-text">My thoughts</strong>
      </MDBNavbarBrand>
      <MDBNavbarToggler onClick={toggleCollapse} />
      <MDBCollapse id="navbarCollapse3" isOpen={isOpen} navbar>
        <MDBNavbarNav right>
          <MDBNavItem active>
            <MDBNavLink to="/" onClick={toggleCollapse}>
              Home
            </MDBNavLink>
          </MDBNavItem>

          {isLoggedIn ? (
            <>
              <MDBNavItem>
                <MDBNavLink to="/user/1231" onClick={toggleCollapse}>
                  my profile
                </MDBNavLink>
              </MDBNavItem>
              <MDBNavItem>
                <MDBNavLink to="/" onClick={onLogout}>
                  Logout
                </MDBNavLink>
              </MDBNavItem>
            </>
          ) : (
            <>
              <MDBNavItem>
                <MDBNavLink to="/signup" onClick={toggleCollapse}>
                  Sign up
                </MDBNavLink>
              </MDBNavItem>
              <MDBNavItem>
                <MDBNavLink to="/Signin" onClick={toggleCollapse}>
                  Sign in
                </MDBNavLink>
              </MDBNavItem>
            </>
          )}
        </MDBNavbarNav>
      </MDBCollapse>
    </MDBNavbar>
  );
};

export default Navigation;
