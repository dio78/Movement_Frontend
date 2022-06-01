import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import AddIcon from '@mui/icons-material/Add';
import { saveLibraryVid } from "../actions/actions";
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
        `http://localhost:8000/api/library/`, headerConfig
      );

      const { data, status } = await request
      
      if (status === 200) {
        console.log(data);
        
        const newArray = [];
        data.forEach((item) => {
          newArray.push(item.movement_id)
        })
        setSavedMovementArray(newArray);
      } else {
        alert('oops')
      }
    } catch(error) {
      console.log(error);
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
        `http://localhost:8000/api/movements/`, headerConfig
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
        console.log(1)
        if (savedMovementArray.includes(movement.movement_id)) {
          let newArray = [...movementArray];
          newArray.splice(i, 1);
          setMovementArray(newArray);
        }


        return(
          <Row>
          <Col key={i} xs={{span: 3, offset: 2}} className='mb-5'>
             
            <PhotoContainer>
              <ThumbnailImage src={movement.thumbnail} alt='Thumbnail of video that is described in title above' onClick={() => alert('clicked')}></ThumbnailImage>
              {/* <TitleLabel>{movement.title}</TitleLabel> */}
              <AddButton onClick={handleAdd} id={movement.movement_id}>
                <AddIcon id={movement.movement_id}/>
                Add
              </AddButton>
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
position: absolute;
display: inline-flex;
top: 93%;
left: 93%;
transform: translate(-50%, -50%);
-ms-transform: translate(-50%, -50%);
background-color: #6DCB6B;
color: #FFFFFF;
font-size: 16px;
font-weight: bold;
padding: 6px 10px 6px 5px;
border: none;
cursor: pointer;
border-radius: 5px;

&:hover{
  background-color: #62B761;
}
`

const PhotoContainer = styled.div`
  position: relative;
`