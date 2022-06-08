
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Row, Col } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { removeLibraryVid, serverURL } from "../actions/actions";



export default function Library () {

  let navigate = useNavigate();
  const [movementArray, setMovementArray] = useState([]);
  const [learn, setLearn] = useState(false);

  useEffect(()=> {
    getSavedVideos();
  },[movementArray])

  const getSavedVideos = async () => {
  
    try {
      const headerConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          'Content-Type': 'application/json',
        },
      };
      
      const request = axios.get(
        `${serverURL}/api/library/`, headerConfig
      );

      const { data, status } = await request
      
      if (status === 200) {

        setMovementArray(data);

      } else {
        alert('oops')
      }
    } catch(error) {
      console.log(error);
    };
  }

  const DisplayVideos = () => {
    if (movementArray.length === 0) {
      return null
    }
  }

  const handleLearn = (e) => {
    e.preventDefault();

    const body = {
      user_id: JSON.parse(localStorage.currentUser).user_id,
      movement_id: e.target.id
    };

    const movement_id = parseInt(e.target.id)

    useRef.current = movement_id;

    

    setLearn(true);

  }

  const handleRemove = (e) => {
    e.preventDefault();

    const movement_id = parseInt(e.target.id)

    const body = {
      user_id: JSON.parse(localStorage.currentUser).user_id,
      movement_id: movement_id
    };

    removeLibraryVid(body);
  }

  return (
    <main style={{ padding: "1rem 0" }}>
      <DisplayVideos />
      {movementArray.length > 0 && movementArray.map((movement, i) => {
        return(
          <Row>
          <Col key={i} xs={{span: 3, offset: 2}} className='mb-5'>
             
            <PhotoContainer>
              <Row>
                <Col>
                <ThumbnailImage src={movement.thumbnail} alt='Thumbnail of video that is described in title above' onClick={() => alert('clicked')}></ThumbnailImage>
                </Col>
              </Row>
              <Row>
                <Col className="text-center">
                  <AddButton onClick={() => navigate(`/learn/${movement.movement_id}`)} id={movement.movement_id}>
                  Learn
                </AddButton>
                <RemoveButton onClick={handleRemove} id={movement.movement_id}>Remove</RemoveButton>
                </Col>
              </Row>
             
              
              
            </PhotoContainer>
          </Col>
          <Col>
          <TitleLabel>{movement.title}</TitleLabel>
          <UsernameDisplay>{movement.username}</UsernameDisplay>
          <Row>
            <Col className="mt-3">
              <h5>{movement.steps.length} steps</h5>  
            </Col>
          </Row>
          
        </Col>
        </Row>
          
        )
      })}
      {learn && 
      <Navigate to='/learn' replace={true} />}
    </main>
    
  );
} 


const ThumbnailImage = styled.img`
  border-radius: 10px;
  width: 100%;
`

const UsernameDisplay = styled.h5`
  font-weight: bold;
`

const TitleLabel = styled.h2`
`

const AddButton = styled.button`
display: inline-flex;
background-color: #6DCB6B;
color: #FFFFFF;
font-size: 16px;
font-weight: bold;
padding: 6px 10px 6px 5px;
border: none;
cursor: pointer;
margin-right: .5rem;
border-radius: 5px;

&:hover{
  background-color: #62B761;
}
`

const RemoveButton = styled.button`
display: inline-flex;
background-color: red;
color: #FFFFFF;
font-size: 16px;
font-weight: bold;
padding: 6px 10px 6px 5px;
border: none;
cursor: pointer;
margin-left: .5rem;
border-radius: 5px;


&:hover{
  background-color: #d30606;
}
`

const PhotoContainer = styled.div`
  position: relative;
`