import React, { useState, useContext } from 'react';

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

const Navigation = ({ user }) => {
  const { isLoggedIn, setAuth, setUserData } = useContext(MyContext);

  const [isOpen, toggleIsOpen] = useState(false);

  const toggleCollapse = () => {
    toggleIsOpen(!isOpen);
  };

  const onLogout = () => {
    localStorage.clear('token');
    toggleIsOpen(!isOpen);
    setAuth(false);
    setUserData({});
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
          <MDBNavItem>
            <MDBNavLink to="/" onClick={toggleCollapse}>
              Home
            </MDBNavLink>
          </MDBNavItem>

          {isLoggedIn ? (
            <>
              <MDBNavItem>
                {user && !user.isCompleted && (
                  <MDBNavLink to="/complete-signup" onClick={toggleCollapse}>
                    complete user
                  </MDBNavLink>
                )}
              </MDBNavItem>
              <MDBNavItem>
                <MDBNavLink to="/me" onClick={toggleCollapse}>
                  {user && user.name}
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
                <MDBNavLink to="/resend-verification" onClick={toggleCollapse}>
                  resend verification
                </MDBNavLink>
              </MDBNavItem>
              <MDBNavItem>
                <MDBNavLink to="/forgot-password" onClick={toggleCollapse}>
                  forgot password
                </MDBNavLink>
              </MDBNavItem>
              <MDBNavItem>
                <MDBNavLink to="/Signin" onClick={toggleCollapse}>
                  Sign in
                </MDBNavLink>
              </MDBNavItem>
              <MDBNavItem>
                <MDBNavLink to="/signup" onClick={toggleCollapse}>
                  Sign up
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
