import { useParams } from "react-router-dom"
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import LearningSkeletonOverlay from "./LearningSkeletonOverlay";
import * as poseDetection from '@tensorflow-models/pose-detection';
import styled from "styled-components";

export default function Learn () {
  let [movement, setMovement] = useState({})
  const CanvasRef = useRef(null);
  const runningPlaybackRef = useRef(false);
  let [playbackSpeed, setPlaybackSpeed] = useState(50);
  const StepCanvasRef = useRef(null);
  const [nose, setNose] = useState(null);
  const [stepsArray, setStepsArray] = useState(null);
  const imageDetectorRef = useRef(null);


  let { id } = useParams();

  useEffect(()=> {
    getMovement();
  },[])


  const movenetLoad = async () => {

    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox,
      multiPoseMaxDimension: 512
    };

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    imageDetectorRef.current = detector;
  }

  const drawSkeleton = (canvas, keypoints) => {
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1500, 1300);

    debugger;
    drawKeypoints(keypoints, ctx);
    drawBones(keypoints, ctx);
  }

  const drawKeypoints = (keypoints, ctx) => {
    debugger;
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

  const getMovement = async () => {
    
    try {
      const headerConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          'Content-Type': 'application/json',
        },
      };

      

      const request = axios.get(
        `http://localhost:8000/api/learn/${id}`, headerConfig, { params: { answer: 42 } }
      );

      const { data, status } = await request
      
      if (status === 200) {

        setMovement(data[0]);
        console.log(data);
        
      } else {
        alert('oops')
      }
    } catch(error) {
      console.log(error);
    };
  }

  const drawSteps = () => {

    const drawSkeleton = (pose) => {
      
      const ctx = StepCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 700, 500);
      const keypoints = pose[0][0];
  
      drawKeypoints(keypoints, ctx);
      drawBones(keypoints, ctx);
    }
  
    const drawKeypoints = (keypoints, ctx) => {
      keypoints.forEach(keypoint => {
        if (keypoint.name === 'nose') {
          setNose(keypoint.x);
        }
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


    drawSkeleton(movement.steps)
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
    }, 90 - playbackSpeed)
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

    const keypointArray = movement.keyframes;

    if (keypointArray.length > 0) {
      console.log('click')
      // const poses = keypointArray.map((x) => {
      //   return x;
      // });
      console.log(typeof keypointArray);
      console.log(keypointArray);
      
      drawPlaybackSkeleton(CanvasRef, keypointArray)
    }
  } 
  
  const CanvasElement = (props) => {
    
    const canvas = useRef();

    debugger;

    useEffect(() => {
      const context = canvas.current.getContext('2d');

      drawSkeleton(canvas.current, props.keypoints)
    })
    return (
      <canvas ref={canvas}
      
      width='700px'
      height='350px'
      
      style={{
        display: "inline-block",
        width: '100%',
        zIndex: 4, 
        borderStyle: 'solid',
        borderColor: 'blue',
        borderWidth: '5px',
        borderRadius: '10px'
      }}
      />
  )
  }

  const ImageCanvasElement = (props) => {

    debugger;
    const data = movement.steps[props.index - 1].image;

    debugger;
    return (
      <img src={data}
      
      // width='700px'
      // height='400px'
      
      style={{
        display: "inline-block",
        width: '100%',
        zIndex: 4, 
        borderRadius: '10px'
      }}
      />
    )
      
  }

  return(

    <Container fluid>
    <Row>
      <Col>
      <div>Now Learning: "{movement.title}"  by {movement.username}</div>
      </Col>
    </Row>

    <Row >
      <Col className='text-center'>
        <Row>
          <Col>
          <LearningSkeletonOverlay />
            <canvas  ref={CanvasRef}
              width='640px'
              height='480px'
              style={{
                zIndex: 2, 
                borderStyle: 'solid',
                borderColor: 'blue',
                borderWidth: '5px',
                borderRadius: '10px',
                position: 'relative'
              }}/>
          </Col>
        </Row>
        <StyledButton type="button" onClick={handlePlayClick}>Play</StyledButton>
            <div>
              <input type='range' min='10' max='90' step='5' onChange={(e) => setPlaybackSpeed(e.target.value)} style={{'width': '20%'}}/>
              <p>Playback Speed: {playbackSpeed/50}x</p>
            </div>
      </Col>
      {/* <Col xs={6} className='text-center'>
        <LearningSkeleton />
      </Col>  */}
        
    </Row>
    <Row>
            {movement.steps && movement.steps.map((step, i) => {
              
              debugger;
              const value = {
                index: i + 1
              };
              debugger;
    
              const keypoints = {
                keypoints: step.skeleton
              };
    
              return(
                <>
                <Row>
                  <Col xs={6} className="text-center mt-5">
                    <Row>
                      <Col xs={6}>
                      <CanvasElement {...keypoints} {...value}/>
                      </Col>
                      <Col xs={6}>
                      <ImageCanvasElement {...value}/>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={3} className='mt-5'>
                    <Row>
                      <Col>
                        <h5>Step {i + 1}</h5>
                      </Col>
                    </Row>
                    {step.description === '' &&
                    <Row>
                      <Col className="mt-5">
                        <div>No description provided</div>
                      </Col>
                    </Row>
                    }
                  </Col>
                </Row>
                  
                </>
              )
            })}
            </Row>
    </Container>

  )
}

const StyledButton = styled.button`
  margin: .5rem;
  background-color: #3A36E7;
  border-radius: 5px;
  color: #FFFFFF;
  border: none;
  padding: 5px 10px;

  &:hover {
    background-color: #2B28B2;
  }
`
const StyledTextarea = styled.textarea`
  border-radius: 5px;
  resize: none;
  

  &:focus {
    background-color: #e5fff3;
  }

`