// import './App.css';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import { Button, Row, Col, Form } from 'react-bootstrap';
import axios from  'axios';
import { render } from 'react-dom';



function Skeleton() {
  
  const [keypointArray, setKeypointArray] = useState([]);
  const [recording, setRecording] = useState(false);
  const counterRef = useRef(0);
  const runningPlaybackRef = useRef(false);
  const detectorRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const camRef = useRef(null);
  const otherVidRef = useRef(null);
  const canvasRef = useRef(null);
  const secondCanvasRef = useRef(null);
  const [uploadModal, setUploadModal] = useState(false);

  const newArray = [];
  const [imageArray, setImageArray] = useState([]);

  const movenetLoad = async () => {

    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox
    };

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    detectorRef.current = detector;
  }
  // !!
  // RECORD VIDEO CODE
  // !!
  // const recordVideo = useCallback(() => {
  //   videoRecorderRef.current = new MediaRecorder(camRef.current.stream, {
  //     mimeType: "video/webm",
  //     videoBitsPerSecond : 2500000
  //   });
  
  //   videoRecorderRef.current.addEventListener(
  //     "dataavailable",
  //     handleDataAvailable
  //   );
  //   videoRecorderRef.current.start(10);

  // }, [camRef, recording, videoRecorderRef]);

  // const [recordedChunks, setRecordedChunks] = useState([]);

  // const handleDataAvailable = useCallback(
  //   ({ data }) => {
  //   // 
  //     if (data.size > 0) {
  //       ;
  //       setRecordedChunks((prev) => prev.concat(data));
  //     }
  //   },
  //   [setRecordedChunks]
  // );

  // const stopRecordVideo = useCallback(() => {
  //   ;
  //   videoRecorderRef.current.stop();
  //   ;
  // }, [videoRecorderRef, camRef]);

  useEffect(() => {  
    
    const interval = setInterval(() => {
      // counterRef.current = counterRef.current + 1;
      // console.log(counterRef.current)

        if (detectorRef) {
          detect(detectorRef.current);
        }
    }, 10);

    if (recording) {
      console.log('started recording')
    } else {
      console.log('stopped recording')
    }

    return () => {
      clearInterval(interval);
    };
  }, [recording]);

  useEffect(() => {
    
  }, [keypointArray])

  const detect = async (detector) => {
    if (camRef.current == null) {
      return;
    }
    
    const video = camRef.current.video;

    const pose = await detector.estimatePoses(video);
    
    
    drawSkeleton(canvasRef, pose);
    if(recording) {
      newArray.push(pose[0].keypoints);

    }
  }

  const drawSkeleton = (canvas, pose) => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, 700, 500);
    const keypoints = pose[0].keypoints;

    drawKeypoints(keypoints, ctx);
    drawBones(keypoints, ctx);
  }

  const drawKeypoints = (keypoints, ctx) => {
    keypoints.forEach(keypoint => {
      if (keypoint.score > 0.1) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2*Math.PI)
        ctx.stroke();
      }
    });
  }

  const drawBones = (keypoints, ctx) => {
    const [nose, leftEye, rightEye, leftEar, rightEar, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle] = keypoints;

    const pairs = [[leftEye, rightEye], [leftShoulder, rightShoulder], [leftShoulder, leftElbow], [rightShoulder, rightElbow], [leftElbow, leftWrist], [rightElbow, rightWrist], [leftShoulder, rightShoulder], [leftShoulder, leftHip], [rightShoulder, rightHip], [leftHip, rightHip], [leftHip, leftKnee], [rightHip, rightKnee], [leftKnee, leftAnkle], [rightKnee, rightAnkle]]

    pairs.forEach((pair) => {
      if (pair[0].score > 0.1 && pair[1].score > 0.1) {
        ctx.moveTo(pair[0].x, pair[0].y);
        ctx.lineTo(pair[1].x, pair[1].y);
        ctx.stroke();
      }
    })
    
  }

  movenetLoad();

  const RecordStatus = () => {
    if (recording) {
      return (
        <h2>Recording!</h2>
      )
    }

    return (
      <h2>Not Recording</h2>
    )
  }

  const handleClick = (e) => {
    console.log('clicking')
    e.preventDefault();
    handleScreenshot();
    if (newArray.length > 0) {
      setKeypointArray(newArray);
    }
    setRecording(recording => !recording);
    
  }


  const runPlayback = (poses, ctx) => {
    let counter = 0;
    runningPlaybackRef.current = true;
    let intervalId = setInterval(() => {
      const maxCount = poses.length - 1;
      if (counter === maxCount) {
        
        runningPlaybackRef.current = false;
        clearInterval(intervalId)
        intervalId = null;
        ctx.clearRect(0, 0, 700, 500);
      } else {
        ctx.clearRect(0, 0, 700, 500);
        drawPlaybackKeypoints(counter, poses, ctx);
        drawPlaybackBones(counter, poses, ctx);
        counter++;
      }
    }, 10)
  }

  const drawPlaybackKeypoints = (counter, poses, ctx) => {
    // ctx.clearRect(0, 0, 700, 500);

    const pose = poses[counter];

    pose.forEach(keypoint => {
      if (keypoint.score > 0.1) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2*Math.PI)
        ctx.stroke();
      }
    });
  }

  const drawPlaybackBones = (counter, poses, ctx) => {
    const keypoints = poses[counter];
    const [nose, leftEye, rightEye, leftEar, rightEar, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle] = keypoints;

    const pairs = [[leftEye, rightEye], [leftShoulder, rightShoulder], [leftShoulder, leftElbow], [rightShoulder, rightElbow], [leftElbow, leftWrist], [rightElbow, rightWrist], [leftShoulder, rightShoulder], [leftShoulder, leftHip], [rightShoulder, rightHip], [leftHip, rightHip], [leftHip, leftKnee], [rightHip, rightKnee], [leftKnee, leftAnkle], [rightKnee, rightAnkle]]

    pairs.forEach((pair) => {
      if (pair[0].score > 0.1 && pair[1].score > 0.1) {
        ctx.moveTo(pair[0].x, pair[0].y);
        ctx.lineTo(pair[1].x, pair[1].y);
        ctx.stroke();
      }
    })
  }

  const drawPlaybackSkeleton = (canvas, poses) => {
    const ctx = canvas.current.getContext('2d');
    if (!runningPlaybackRef.current){
      runPlayback(poses, ctx)
    } else {
      console.log('nice try')
    }    
  }

  const handlePlayClick = async (e) => {
    e.preventDefault();
    if (keypointArray.length > 0) {
      console.log('click')
      // const poses = keypointArray.map((x) => {
      //   return x;
      // });
      console.log(typeof keypointArray);
      console.log(keypointArray);
      
      drawPlaybackSkeleton(secondCanvasRef, keypointArray)
    }
  } 
  
  const handleScreenshot = (e) => {
    // e.preventDefault();
    const imgSrc = camRef.current.getScreenshot();
    const newArray = [...imageArray, imgSrc]
    setImageArray(newArray)
    console.log(imageArray);
  }
  
  const VideoMaybe = () => {
    if (file) {
      return (
        <video style={{
          width: '10rem',
          // height: '480px',
          zIndex: 2 }} ref={otherVidRef} src={file} type='video/mp4' controls></video>
      )
    } else {
      return (
        <img width={'100rem'} src='https://cdn.mos.cms.futurecdn.net/JYEXpJURGks76oHVBc5cik.jpg'></img>
      )
    }
  }

  const [file, setFile] = useState();
  const handleFileChoose = (e) => {
    
    const objectUrl = URL.createObjectURL(e.target.files[0]);
    setFile(objectUrl);

  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const UploadModal = () => {
    if (!uploadModal) {
      return null;
    } else {
      render (
        <Form>
          <Form.Group className="mb-3" controlId="formBasicText">
            <Form.Label>Movement Title</Form.Label>
            <Form.Control type="text" placeholder="Enter email" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicTextArea">
            <Form.Label>Movement Description</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Explain your movement" value={description} onChange={(e) => setDescription(e.target.value)}/>
          </Form.Group>

          {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group> */}
          
          <Button variant="primary" type="click" onClick={handleKeyframeSubmit}>
            Submit
          </Button>
        </Form>
      )
    }
  }

  
  const handleKeyframeSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: title,
      description: description,
      keypointArray: keypointArray
    }
    console.log(data);
    alert(title + ' ' + description)
    console.log(imageArray[0])
    debugger;
    const body = {
      user_id: 1,
      title: title,
      description: description,
      thumbnail: imageArray[0],
      keyframes: JSON.stringify(keypointArray),
      canvas_height: 480,
      canvas_width: 640
    };

    try {
      const request = axios.post(
        `http://localhost:8000/api/movements/`,
        body
      );

      const { status } = await request
      
      if (status === 200) {
        alert('nice!')
      } else {
        alert('oops')
      }
    } catch(error) {
      console.log(error);
    };

  }

  return (
    <div>
    <Row className='mt-5' >
      <Col className='text-center' xs={{ span: 6, offset: 3 }}>

      <canvas ref={canvasRef}
        width='640px'
        height='480px'
        style={{
          position: 'absolute',
          zIndex: 2, 
          // borderStyle: 'solid',
          // borderColor: 'blue',
          // borderWidth: '5px',
          // borderRadius: '10px'
        }}/>

      <Webcam ref={camRef}
        style={{
          width: '640px',
          height: '480px',
          zIndex: 2
        }}/>        
      </Col>
    </Row>
    <Row>
      <Col xs={{ span: 6, offset: 3 }} className='text-center mt-2'>
        <Button type='button' onClick={handleClick}>Record</Button>
        <RecordStatus />
      </Col>
    </Row>
    <Row>
      <Col xs={{ span: 6, offset: 3 }} className='text-center'>
      <canvas className='mt-5' ref={secondCanvasRef}
        width='640px'
        height='480px'
        style={{
          zIndex: 2, 
          borderStyle: 'solid',
          borderColor: 'blue',
          borderWidth: '5px',
          borderRadius: '10px'
        }}/>
      </Col>
      <Col xs={{ span: 6, offset: 3 }} className='text-center'>
        <Button style={{marginLeft: '20px'}} type='button' onClick={handlePlayClick}>Play Back</Button>
        {/* <Button style={{marginLeft: '20px'}} type='button' onClick={() => setUploadModal(!uploadModal)}>Upload</Button> */}
      </Col>
      {/* <button onClick={handleScreenshot}>Screenshot</button> */}
      {/* <UploadModal /> */}
      {uploadModal && 
        <Form>
            <Form.Group className="mb-3" controlId="formBasicText">
              <Form.Label>Movement Title</Form.Label>
              <Form.Control type="text" placeholder="Enter email" value={title} onChange={(e) => setTitle(e.target.value)}/>
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicTextArea">
              <Form.Label>Movement Description</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Explain your movement" value={description} onChange={(e) => setDescription(e.target.value)}/>
            </Form.Group>
            
            <Button variant="primary" type="click" onClick={handleKeyframeSubmit}>
              Submit
            </Button>
          </Form>
      }
    </Row>
    </div>
  );
}

export default Skeleton;