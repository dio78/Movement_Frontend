import axios from "axios";

export const serverURL = process.env.REACT_APP_ROOT_SERVER_URL;

export async function login (email, password) {
  const body = {
    email,
    password
   }

   try {
    const loginRequest = await axios.post(
     `${serverURL}/auth/sign-in`, body
    );

    if (loginRequest.status === 200) {
      localStorage.setItem('token', loginRequest.data.token)
      localStorage.setItem('currentUser', JSON.stringify(loginRequest.data.user))
      debugger;
    }

   } catch (error) {

     return null;
   }

  
   debugger;
}

export async function uploadMovement (body) {
  // const token = localStorage.getItem('token');
  // const headerConfig = {
  //   headers: { Authorization: `Bearer ${token}` },
  // };

  const userInfoObj = JSON.parse(localStorage.getItem('currentUser'));
  debugger;
  const headerConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      'Content-Type': 'application/json',
    },
  };

  try{
    const uploadRequest = await axios.post(
      `${serverURL}/api/movements`, body, headerConfig
    );
  
    if (uploadRequest.status === 200) {
      return 'success!'
    }
  } catch (error) {

    return null;
  }
  
}

export async function saveLibraryVid (body) {
  // const token = localStorage.getItem('token');
  // const headerConfig = {
  //   headers: { Authorization: `Bearer ${token}` },
  // };

  const userInfoObj = JSON.parse(localStorage.getItem('currentUser'));
  debugger;
  const headerConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      'Content-Type': 'application/json',
    },
  };

  try{
    const uploadRequest = await axios.post(
      `${serverURL}/api/library`, body, headerConfig
    );
  
    if (uploadRequest.status === 200) {
      return;
    }
  } catch (error) {

    return null;
  }
  
}

export async function removeLibraryVid (body) {
  // const token = localStorage.getItem('token');
  // const headerConfig = {
  //   headers: { Authorization: `Bearer ${token}` },
  // };

  const userInfoObj = JSON.parse(localStorage.getItem('currentUser'));
  debugger;
  const headerConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      'Content-Type': 'application/json',
    },
  };

  alert('Clicked!')

  try{
    const uploadRequest = await axios.delete(
      `${serverURL}/api/library`, body, headerConfig
    );
  
    if (uploadRequest.status === 200) {
      return;
    }
  } catch (error) {

    return null;
  }
  
}