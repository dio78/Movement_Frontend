import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import AddIcon from '@mui/icons-material/Add';
import { saveLibraryVid, serverURL } from "../actions/actions";
import { Row, Col } from "react-bootstrap";

export default function ThumbnailSection () {

  const [movementArray, setMovementArray] = useState([]);
  const [savedMovementArray, setSavedMovementArray] = useState([]);

  useEffect(()=> {
    getVideos();
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
    
        
        const newArray = [];
        data.forEach((item) => {
          newArray.push(item.movement_id)
        })
        setSavedMovementArray(newArray);
      } else {
        alert('oops')
      }
    } catch(error) {

    };
  }

  const getVideos = async () => {
    
    try {
      const headerConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          'Content-Type': 'application/json',
        },
      };

      const request = axios.get(
        `${serverURL}/api/movements/`, headerConfig
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
      return null;
    }
  }

  const handleAdd = (e) => {
    e.preventDefault();

    
    const movement_id = parseInt(e.target.id)

    const body = {
      user_id: JSON.parse(localStorage.currentUser).user_id,
      movement_id: movement_id
    };

    saveLibraryVid(body);

    
  }

  return (
    <main style={{ padding: "1rem 0" }}>
      <Row>
        <Col>
        <DisplayVideos />
      {movementArray.length > 0 && movementArray.map((movement, i) => {

        if (savedMovementArray.includes(movement.movement_id)) {
          let newArray = [...movementArray];
          newArray.splice(i, 1);
          setMovementArray(newArray);
        }


        return(
          <Row>
            <Col xs={{span: 4, offset: 2}}>
              <Row>
                <Col key={i} className=''>
                
                  <PhotoContainer>
                    <ThumbnailImage src={movement.thumbnail} alt='Thumbnail of video that is described in title above' onClick={() => alert('clicked')}></ThumbnailImage>
                    {/* <TitleLabel>{movement.title}</TitleLabel> */}

                    
                  </PhotoContainer>
                </Col>
              </Row>
              <Row className="mb-5">
                <Col className="text-center">
                  <AddButton onClick={handleAdd} id={movement.movement_id}>
                    <AddIcon id={movement.movement_id}/>
                    Add to Library
                  </AddButton>
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <TitleLabel>{movement.title}</TitleLabel>
              <UsernameDisplay>{movement.username}</UsernameDisplay>
              <Row>
                <Col className="mt-3">
                  <h5>{movement.number_of_steps} steps</h5>  
                </Col>
              </Row>              
            </Col>
          </Row>
        )
      })}
        </Col>
      </Row>
      
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
font-size: 1em;
font-weight: bold;
padding: 6px 10px 6px 5px;
border: none;
cursor: pointer;
border-radius: 5px;
margin-top: .5rem;

&:hover{
  background-color: #62B761;
}
`

const PhotoContainer = styled.div`
  position: relative;
`