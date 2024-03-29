import { Row, Col } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import { serverURL } from "../actions/actions";

export default function ThumbnailSection () {

  const [videoArray, setVideoArray] = useState([]);

  useEffect(()=> {
    getVideos();
  },[])

  const getVideos = async () => {
    
    try {
      const request = axios.get(
        `${serverURL}/api/movements/`
      );

      const { data, status } = await request
      
      if (status === 200) {
        setVideoArray(data);

      } else {
        alert('oops')
      }
    } catch(error) {
      console.log(error);
    };
  }

  const DisplayVideos = () => {
    if (videoArray.length === 0) {
      return null;
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