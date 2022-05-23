import { Row, Col } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ThumbnailSection () {

  const [videoArray, setVideoArray] = useState([]);

  useEffect(()=> {
    getVideos();
  },[])

  const getVideos = async () => {
    
    try {
      const request = axios.get(
        `http://localhost:8000/api/movements/`
      );

      const { data, status } = await request
      
      if (status === 200) {
        setVideoArray(data);
        console.log(data);
      } else {
        alert('oops')
      }
    } catch(error) {
      console.log(error);
    };
  }

  const DisplayVideos = () => {
    if (videoArray.length === 0) {
      return (
        <div>
          <h2>There are no videos to show!</h2>
        </div>
      )
    }
  }

  return (
    <main style={{ padding: "1rem 0" }}>
      <DisplayVideos />
      {videoArray.length > 0 && videoArray.map((video, i) => {
        debugger;
        return(
          <Col key={i} xs={{span: 6, offset: 1}} className='mb-5'>
             <h4>{video.title}</h4>
            <img src={video.thumbnail} alt='Thumbnail of video that is described in title above' onClick={() => alert('clicked')}></img>
            <h6>Description: {video.description}</h6>
          </Col>
        )
      })}
    </main>
  );
} 