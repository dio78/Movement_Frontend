import normalizeKeypoints from "./normalizeKeypoints";
import * as poseDetection from '@tensorflow-models/pose-detection';
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Container, Form, Button } from "react-bootstrap";
import { uploadMovement } from "../actions/actions";
import styled from "styled-components";

const SelectKeyframes = (props) => {


  debugger;
  const [selectedKeypointArray, setSelectedKeypointArray] = useState([]);
  const [selectedImageArray, setSelectedImageArray] = useState([]);
  const imageDetectorRef = useRef(null);
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false)
  const [stepsComplete, setStepsComplete] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [stepsArray, setStepsArray] = useState([]);
  

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

  const detect = async (detector, image, dataURL) => {
    if (image == null) {
      console.log('false')
      return;
    }

    const pose = await detector.estimatePoses(image);

    
    if (pose[0]) {
      normalizeKeypoints(pose[0].keypoints, 640, 360.56, image.videoWidth, image.videoHeight)
      
      setStepsArray([...stepsArray, {
        skeleton: pose[0].keypoints,
        image: dataURL
      }])

    } else {
      setStepsArray([...stepsArray, {
        skeleton: [],
        image: dataURL
      }])
    }
    console.log(stepsArray)
    debugger;
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

  movenetLoad(); 

  const handleKeyframeClick = (e) => {
    e.preventDefault();

    debugger;
    // props.setTest('hi!')

    const video = props.otherVidRef.current;
    const canvas = props.selectCanvasRef.current;
    // canvasRef.current.height = canvasRef.current.width * (400/700);
    // const ctx = canvas.getContext('2d')

    // ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    

    const imageCanvas = document.createElement('canvas');

    const context = imageCanvas.getContext('2d')

    context.drawImage(video, 0, 0, imageCanvas.width, imageCanvas.height);

    const dataURL = imageCanvas.toDataURL();

    debugger
    debugger;

    movenetLoad(); 
    detect(imageDetectorRef.current, video, dataURL);
  }

  const CanvasElement = (props) => {
    
    const canvas = useRef();

    debugger;

    React.useEffect(() => {
      const context = canvas.current.getContext('2d');

      drawSkeleton(canvas.current, props.keypoints)
    })

    
    // if(canvas.current) {
    //   drawSkeleton(canvas.current, [keypoints])
    // }

   
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
    const data = stepsArray[props.index - 1].image;

    debugger;
    return (
      <img src={data} onClick={handleImageClick}
      
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

  const submitIt = async (e) => {
    debugger;
    e.preventDefault();

    const newArray = [...stepsArray];

    newArray.forEach((step, i) => {
      const description = document.getElementById(`${i}text`).value;

      step.description = description;
      debugger;
    });

    const updatedArray = [...newArray];

    setStepsArray(updatedArray);

    const body = {
      user_id: JSON.parse(localStorage.currentUser).user_id,
      title: title,
      thumbnail: thumbnailImage,
      keyframes: JSON.stringify(props.keypointArray),
      steps: JSON.stringify(stepsArray)
    };

    const request = await uploadMovement(body);

    if (request === 'success!'){
      debugger
    }
    debugger;
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  
  const handleImageClick = (e) => {
    if (!stepsComplete || done) {
      return;
    }
    
    setThumbnailImage(e.target.src);
    window.scrollTo(0, document.body.scrollHeight)
  }

  const handleTitleDoneClick = (e) => {
    e.preventDefault();
    debugger;
    setDone(true);
    
  }

  const handleStepsDone = () => {
    setStepsComplete(true);

  }

  useEffect(() => {
    if (done === true) {
      window.scrollTo(0, document.body.scrollHeight)
    }

  },[done])

  const InstructionsElement = () => {
    if (stepsComplete) {
      return null;
    }

    if (!stepsArray.length > 0) {
      return (
        <>        
          <h2>Navigate your video, and break your movement down into its most essential steps.</h2>
          <h3>When you are finished, click done!</h3>
          <StyledButton type="button" className="mb-1" onClick={handleKeyframeClick}>Select As Step</StyledButton>
        </>
      )
    }

    return (
      <>        
        <h2>Navigate your video, and break your movement down into its most essential steps.</h2>
        <h3>When you are finished, click done!</h3>
        <StyledButton type="button" className="mb-1" onClick={handleKeyframeClick}>Select As Step</StyledButton>
        <StyledButton type="button" className="mb-1" onClick={handleStepsDone}>Done</StyledButton>
      </>
    )
  }

  const ThumbnailSelectionComponent = () => {
    if (!stepsComplete) {
      return null;
    }

    

    return (
      <>
      
      { thumbnailImage &&
      <>
      <Row>
        <Col>
          <h5>Selected Thumbnail:</h5>
          <img src={thumbnailImage}
        style={{
          display: "inline-block",
          width: '30%',
          zIndex: 4, 
          borderRadius: '10px'
        }}
        />
        </Col>
      </Row>
      <Row>
        <Col className="">
          {stepsComplete && !done &&
            <StyledButton type="button" onClick={handleTitleDoneClick}>Confirm Thumbnail</StyledButton>
          }
         
        </Col>
      </Row>
    </>
      }
      
      <Row>
       <Col>
       </Col>
     </Row>
     </>
    )
  }

if (props.analyzed) {
  return (
    <>
    <Row>
      <Col className="text-center my-3">
        <InstructionsElement />
      </Col>
    </Row>
    <Container fluid>
    <Row>
      <Col xs={12} className="my-1">
        <Row>
          <Col className="text-center">
            {stepsComplete && !done &&
            <h2>3. Select a thumbnail for your movement by clicking one of your step images.</h2> }
          </Col>
        </Row>
        <Row>
          <Col xs={{span: 10, offset: 1}} className='mb-5'>
            <Row>
            {stepsArray.length > 0 && stepsArray.map((step, i) => {
              
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
                  <Col xs={6} className='mt-5'>
                    <Row>
                      <Col>
                        <h5>Describe this step:</h5>
                      </Col>
                    </Row>
                    <StyledTextarea id={i + "text"} type='textarea'
                    style={{
                      width: '80%',
                      height: '75%'
                    }}></StyledTextarea>
                  </Col>
                </Row>
                  
                </>
              )
            })}
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row>
      <Col className="text-center">
        <ThumbnailSelectionComponent />
      </Col>
    </Row>
   
   
        {done && 
           <Row>
            <Col className="mt-5 text-center">
              <h3>4. Give your Movement a title and share it with others!</h3>
          <StyledTitleForm>
            <Row>
              <Col className="text-center mt-3">
                <StyledTitleLabel for="title">Movement Title</StyledTitleLabel>
              </Col>
            </Row>
            <Row>
              <Col className="text-center">
                <StyledTitleInput required className="text-center" type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}/>
              </Col>
            </Row>
            <Row>
              <Col className="text-center mt-2 mb-5">
                <StyledButton onClick={submitIt}>Submit Movement</StyledButton>
              </Col>
            </Row>
            
          </StyledTitleForm>
            </Col>
           </Row>
          }
     
    </Container>
    </>
  )
} else {
  return null;
}
};


const StyledTitleLabel = styled.label`

`
const StyledTitleForm = styled.label`

`

const StyledTitleInput = styled.input`
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ccc;
`

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

export default SelectKeyframes;