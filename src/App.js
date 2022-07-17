import {Outlet, NavLink, Navigate } from "react-router-dom";
import styled from "styled-components";
import SearchIcon from '@mui/icons-material/Search';
import { Dropdown, FormControl } from "react-bootstrap";
import { useState } from "react";
import React from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function App() {

  const [loggedOut, setLoggedOut] = useState(false);
  
  // The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
    &#x25bc;
  </a>
));

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    const [value, setValue] = useState('');

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) =>
              !value || child.props.children.toLowerCase().startsWith(value),
          )}
        </ul>
      </div>
    );
  },
);

const DropdownElement = () => {
  
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    debugger
    setLoggedOut(true);
  }
  return (
    <StyledDropdown>
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
            <AccountCircleIcon />
          </Dropdown.Toggle>

          <Dropdown.Menu as={CustomMenu} className='mt-0'>
            <Dropdown.Item eventKey="1" onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </StyledDropdown>
  )
}

  return (
    <div>
      <NavItems>
        <BrandTitle className="mx-4">MOVEMENT</BrandTitle>
        {/* <div>
          <SearchBar placeholder="Search..."/>
          <StyledSearchIcon />
        </div> */}
        <div>
          <NavLink to="/">
            <li>Home</li>
          </NavLink> |
          <NavLink to="/library">
            <li>Library</li>
          </NavLink> |
          <NavLink to="/create">
            <li>Create</li>
          </NavLink> |{" "}
          <NavLink to="/skeleton">
            <li>Skeleton</li>
          </NavLink> |
          <NavLink to="/compare">
            <li>Compare</li>
          </NavLink> |
        </div>
        <DropdownElement />
      </NavItems>
      {loggedOut &&
      <Navigate to="/login" replace={true} />}
      <Outlet />
    </div>
  );
}

const StyledDropdown = styled(Dropdown)`
  display: flex;
  margin: 0 10px 5px ;
`

const SearchBar = styled.input`
  display: inline;
  border-radius: 5px;
  margin-bottom: 5px;
  border: none
`
const StyledSearchIcon = styled(SearchIcon)`
  color: #FFFFFF;
  margin-left: 5px;
`

const NavItems = styled.ul`

  justify-content: space-between;

  display: flex;

  background-color: #212529;
  
  text-align: center;

  padding-top: .5rem;
  a {
    text-decoration: none;
  }

  li {
    color: #FFFFFF;
    list-style: none;
    position: relative;
    margin: 0 1rem;
    display: inline;
  }
`

const BrandTitle = styled.h1`
  font-size: 1.5rem;
  color: #3A36E7;
`