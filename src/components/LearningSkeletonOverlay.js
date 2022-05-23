// import './App.css';
import React, { useRef, useEffect, useState} from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import { Row, Col, Container, Button } from 'react-bootstrap';




function LearningSkeletonOverlay() {

  const detectorRef = useRef(null);
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  const [showFace, setShowFace] = useState(true);
  let [magnifier, setMagnifier] = useState(null);

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
      // counterRef.current = counterRef.current + 1;
      // console.log(counterRef.current)

        if (detectorRef) {
          detect(detectorRef.current);
        }
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const detect = async (detector) => {
    if (camRef.current == null) {
      return;
    }
    
    const video = camRef.current.video;

    const pose = await detector.estimatePoses(video);
    
    // let result = true;

    let result = pose[0].keypoints.every( e => e.score > .1);

    const widthRatio = 1 / magnifier;
    const heightRatio = 1 / magnifier;

    if (magnifier)
    pose.forEach(keypoint => {
    keypoint.x = keypoint.x * widthRatio;
    keypoint.y = keypoint.y * heightRatio;
    })
    
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth
    // if (result) {
    //   drawSkeleton(canvas, pose);
    // } else {
    //   drawWarning(canvas)
    // }
    
    drawSkeleton(canvas, pose);
  }

  const drawWarning = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 700, 500);
    ctx.font = '48px serif';
    ctx.fillStyle = 'White'
    
    ctx.fillRect(250,200,150, 100)
    ctx.fillStyle ='black'
    ctx.fillText('Move back until all', 200, 250);
  }

  const drawSkeleton = (canvas, pose) => {
    const ctx = canvas.getContext('2d');
   
    ctx.clearRect(0, 0, 700, 500);
    ctx.strokeStyle='red'
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

  return (
    <Container>
      <Row>
        <Col xs={6} className='text-center'>
          <canvas ref={canvasRef} className=''
              width='640px'
              height='480px'
              style={{
                position: 'absolute',
                zIndex: 6, 
                // borderStyle: 'solid',
                // borderColor: 'red',
                // borderWidth: '5px',

              }}/>
            <Webcam ref={camRef}
              style={{
                width: '640px',
                height: '480px',
                zIndex: 6,
                visibility: 'hidden',
                position: 'absolute'   
              }}/>

        </Col>
      </Row>
    </Container>
    
  );
}

export default LearningSkeletonOverlay;