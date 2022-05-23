// import './App.css';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import { Button, Row, Col, Input } from 'react-bootstrap';



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


  const [videoDimensions, setVideoDimensions]  = useState(null);

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

  useEffect(() => {  
    
    const interval = setInterval(() => {
        if (detectorRef && otherVidRef.current) {
          
          detect(detectorRef.current);
        }
    }, 10);

    if (recording) {
      console.log('started recording')
      // recordVideo();
    } else {
      // if (recordedChunks.length > 0) {
      //   debugger;
      //   stopRecordVideo();
      // }
      console.log('stopped recording')
    }

    return () => {
      clearInterval(interval);
    };
  }, [recording, detectorRef.current]);

  useEffect(() => {
  }, [keypointArray])

  const detect = async (detector) => {
    if (otherVidRef.current == null) {
      console.log('false')
      return;
    }

    const video = otherVidRef.current;

    const pose = await detector.estimatePoses(video);
    
    
    drawSkeleton(canvasRef, pose);
    if(recording) {
      newArray.push(pose[0].keypoints);

    }
  }

  const drawSkeleton = (canvas, pose) => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, 1500, 1300);
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
        <h2>Analyzing Video!</h2>
      )
    }

    return null
  }

  const handleClick = (e) => {
    console.log('clicking')
    // e.preventDefault();
    if (newArray.length > 0) {
      setKeypointArray(newArray);
    }
    setRecording(recording => !recording);
    debugger;
    
  }
  
  const handleScreenshot = (e) => {
    e.preventDefault();
    const imgSrc = camRef.current.getScreenshot();
    const newArray = [...imageArray, imgSrc]
    setImageArray(newArray)
    console.log(imageArray);
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
        ctx.clearRect(0, 0, 1500, 1300);
      } else {
        ctx.clearRect(0, 0, 1500, 1300);
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

  const handlePlayClick = (e) => {
    // e.preventDefault();
    if (keypointArray.length > 0) {
      console.log('click')
      // const poses = keypointArray.map((x) => {
      //   return x;
      // });
      drawPlaybackSkeleton(secondCanvasRef, keypointArray)
    }
  } 
  
  const handleLoad = (e) => {
    debugger
    if (!videoDimensions) {
      handleClick();
      setVideoDimensions([e.target.videoWidth, e.target.videoHeight])
      console.log(e);
    }

  }
  
  const handleEnded = () => {
    if (recording) {
      handleClick();
    }
    otherVidRef.autoPlay = false;
  }

  const playVid = () => {
    alert('play')
    otherVidRef.play()
  }

  const VideoMaybe = () => {
    if (file) {
      debugger;
      return (
        <video ref={otherVidRef} src={file} type='video/mp4' autoPlay onLoadedMetadata={(e) => handleLoad(e)} onEnded={handleEnded}
        style={{
          zIndex: 4
        }}
        ></video>
      )
    } else {
      return null;
    }
  }

  const [file, setFile] = useState();
  const handleFileChoose = (e) => {
    const objectUrl = URL.createObjectURL(e.target.files[0]);
    setFile(objectUrl);
  }

  const CanvasElement = () => {
    if (videoDimensions) {
      return (
        <canvas ref={canvasRef}
       width= {videoDimensions[0]}
       height={videoDimensions[1]}
       
       style={{
         position: 'absolute',
         zIndex: 4, 
        borderStyle: 'solid',
        borderColor: 'green',
        borderWidth: '5px'
       }}/>
      )
    } else {
      return null;
    }

  }

  return (
    <div>
      <Row className='mt-5' >
      {keypointArray.length === 0 &&
      <Col xs={{ span: 6, offset: 3 }}> 
        <CanvasElement />
        <VideoMaybe/>   
      </Col>
      }
        
      </Row>
      <Row classname='mt-1'>
        <Col xs={{ span: 6, offset: 3 }} className='text-center'>
          {/* <Button type='button' onClick={handleClick}>Analyze</Button> */}
          <RecordStatus />
        </Col>   
      </Row>
      <Row>
        <Col xs={{ span: 6, offset: 3 }}>
        {keypointArray.length > 0 && videoDimensions &&
        <>
        <canvas className='mt-5' ref={secondCanvasRef}
        width= {videoDimensions[0]}
        height={videoDimensions[1]}
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            zIndex: 4, 
            borderStyle: 'solid',
            borderColor: 'red',
            borderWidth: '5px'
          }}/>
          <Button style={{marginLeft: '20px'}} type='button' onClick={handlePlayClick}>Play Back</Button>
          </>
          }
        </Col>
      </Row>
      <Row>
        <Col xs={{span: 2, offset: 5}} className='text-center'>
          {/* <Button style={{marginLeft: '20px'}} type='button' onClick={handleScreenshot}>Capture</Button> */}
          
        </Col>
        <input type="file" onChange={handleFileChoose}/>
      </Row>
    
    </div>
  );
}

export default Skeleton;