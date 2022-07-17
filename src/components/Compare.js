import { Container, Row, Col, Form } from "react-bootstrap";
import styled from "styled-components";
import { keyframes } from "styled-components";
import { useRef, useState, useEffect } from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import normalizeKeypoints from "../tensorActions/normalizeKeypoints";
import SelectKeyframes from "../tensorActions/selectKeyframes";

export default function Compare() {

  let [file1, setFile1] = useState(null); 
  let [file2, setFile2] = useState(null);
  let [test, setTest] = useState('');
  let [analyzed, setAnalyzed] = useState(false);
  let [processing, setProcessing] = useState(true);
  let [keypointArray, setKeypointArray] = useState([])
  let vidRef1 = useRef(null);
  let vidRef2 = useRef(null);
  const detectorRef = useRef(null);
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const selectCanvasRef = useRef(null);
  let [videoLoaded, setVideoLoaded] = useState(false);

  const newArray = []

  const handleFile1Choose = (e) => {
    const objectUrl = URL.createObjectURL(e.target.files[0]);
    setFile1(objectUrl);
  }

  const handleFile2Choose = (e) => {
    const objectUrl = URL.createObjectURL(e.target.files[0]);
    setFile2(objectUrl);
  }

  const movenetLoad = async () => {

    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox,
      multiPoseMaxDimension: 512
    };

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    detectorRef.current = detector;
  }

  useEffect(() => {  
    
    const interval = setInterval(() => {
        if (detectorRef && vidRef1.current) {
          
          detect(detectorRef.current, vidRef1, canvasRef1, '1');
        }
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, [detectorRef.current]);


  useEffect(() => {  
    
    const interval = setInterval(() => {
        if (detectorRef && vidRef2.current) {
          
          detect(detectorRef.current, vidRef2, canvasRef2, '2');
        }
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, [detectorRef.current]);

  

  const detect = async (detector, videoRef, canvasReference, videoNumber) => {
    if (videoRef.current == null) {

      return;
    }

    const video = videoRef.current;
    // video.videoHeight = '360px'
    if (video.readyState === 4) {

      const pose = await detector.estimatePoses(video);

      if (!pose[0]) {
        return;
      }
      // normalizeKeypoints(pose[0].keypoints, 640, 360.56, vidRef1.current.videoWidth, vidRef1.current.videoHeight)

      drawSkeleton(canvasReference, pose, videoRef, videoNumber);

      if(!analyzed && video) {
        newArray.push(pose[0].keypoints);
      }
    }
  }

  const drawSkeleton = (canvas, pose, videoReference, videoNumber) => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, 1500, 1300);
    const keypoints = pose[0].keypoints;
  
    ctx.lineWidth = 5;

    if (videoNumber === '1'){
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "blue";
    }
    
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

  const handleLoaded = (e) => {

    setVideoLoaded(true);

    // vidRef1.current.addEventListener("resize", ev => {
    //   alert('resized!');
    // })

    if (analyzed) {
      e.target.controls = true;
      e.target.autoPlay = false;
    } else {
      e.target.controls = false;
      e.target.play();
    }
  }

  const handleVideoEnded = (e) => {
    if (analyzed) {
      return;
    }
    e.target.autoPlay = false;
    setAnalyzed(true);
    setProcessing(false);

    const newArray2 = [...newArray]
    debugger;
    setKeypointArray(newArray2);
  }
 
  
  const VideoUpload1 = () => {
    if (file1) {
      return (
        <StyledVideoUpload ref={vidRef1} src={file1} type='video/mp4' onLoadedMetadata={handleLoaded} onEnded={handleVideoEnded}></ StyledVideoUpload>
      )
    } else {
      return null;
    }
  }

  const VideoUpload2 = () => {
    if (file1) {
      return (
        <StyledVideoUpload ref={vidRef2} src={file2} type='video/mp4' onLoadedMetadata={handleLoaded} onEnded={handleVideoEnded}></ StyledVideoUpload>
      )
    } else {
      return null;
    }
  }

  const PreUpload1 = () => {
    return(
      <Container>
        <Row>


          <Col xs={{span: 10, offset: 1}} className="text-center mt-5 mb-5">
            <Quote><em>Compare two movements with eachother</em></Quote>
          </Col>
        </Row>
        <Row>
        <Col xs={{span: 8, offset: 2}} className="text-center mt-5">
          <div>
            <h1>Upload video 1</h1>
          </div>
          <UploadLabel>
            Upload a video
            <HiddenFileInput type="file" onChange={handleFile1Choose} />
          </UploadLabel>
          </Col>
        </Row>
      </Container>
    )
  }
  
  const PreUpload2 = () => {
    return(
      <Container>
        <Row>


          <Col xs={{span: 10, offset: 1}} className="text-center mt-5 mb-5">
            <Quote><em>Compare two movements with eachother</em></Quote>
          </Col>
        </Row>
        <Row>
        <Col xs={{span: 8, offset: 2}} className="text-center mt-5">
          <div>
            <h1>Upload video 2</h1>
          </div>
          <UploadLabel>
            Upload a video
            <HiddenFileInput type="file" onChange={handleFile2Choose} />
          </UploadLabel>
          </Col>
        </Row>
      </Container>
    )
  }

  const pullData = (data) => {

    return data;
  }

  const doIt = (e) => {
    e.preventDefault();

    let data = pullData

  }

  const ProcessingComponent = () => {
    if (processing) {
      return (
        <Row>
          <Col>
            <h1>Analyzing Video</h1>
            <Circle />
          </Col>
        </Row>
      )
    } else {
      return null;
    }
  }


  const CanvasElement1 = () => {
    if (!videoLoaded) {
      return null
    } else {
      return (
        <canvas ref={canvasRef1}
              width={vidRef1.current.videoWidth}
              height={vidRef1.current.videoHeight}
              
              style={{
                zIndex: 4, 
                width: 'auto',
                maxHeight: '60vh',
                maxWidth: '85%',
                borderStyle: 'solid',
                borderColor: 'red',
                borderWidth: '5px',
                marginTop: '2rem',
                borderRadius: '10px'
              }}/>
      )
    }
  }

  const CanvasElement2 = () => {
    if (!videoLoaded) {
      return null
    } else {
      return (
        <canvas ref={canvasRef2}
              width={vidRef1.current.videoWidth}
              height={vidRef1.current.videoHeight}
              
              style={{
                zIndex: 4, 
                width: 'auto',
                maxHeight: '60vh',
                maxWidth: '85%',
                borderStyle: 'solid',
                borderColor: 'blue',
                borderWidth: '5px',
                marginTop: '2rem',
                borderRadius: '10px'
              }}/>
      )
    }
  }


  if (!file1) {
    movenetLoad();
    return (
      <PreUpload1 />
    )
  } else if(file1 && !file2) {
    return (
      <PreUpload2 />
    )
  } else if(file1) {
    return (
      <>
        <Container fluid style={{width: "100%"}}>
          <Row>
            <Col>
              <Row>
                <Col xs={6} className="text-center">
                  <VideoUpload1 className="center" />
                </Col>
                  
                <Col xs={6} className="text-center">
                  <CanvasElement1 />
                </Col>
              </Row>
            </Col>
          </Row>     
        </Container>

        <Container fluid style={{width: "100%"}}>
          <Row>
            <Col>
              <Row>
                <Col xs={6} className="text-center">
                  <VideoUpload2 className="center" />
                </Col>
                  
                <Col xs={6} className="text-center">
                  <CanvasElement2 />
                </Col>
              </Row>
            </Col>
          </Row>     
        </Container>
      </>
    )
  } else if(file2) {
    return (
      <>
        <Container fluid style={{width: "100%"}}>
          <Row>
            <Col>
              <Row>
                <Col xs={6} className="text-center">
                  <VideoUpload2 className="center" />
                </Col>
                  
                <Col xs={6} className="text-center">
                  <CanvasElement2 />
                </Col>
              </Row>
            </Col>
          </Row>     
        </Container>
      </>
    )
  }

}

const breatheAnimation = keyframes`
 0% {}
 50% {transform: rotate(180deg);}
 100% {transform: rotate(360deg);}
`
const Circle = styled.div`
 height: 20px;
 width: 20px;

 border-radius: 50%;
 content: "";

 display: inline-block;
 border-style: solid;
 border-width: 5px;
 border-radius: 50%;
 border-color: black;
 border-bottom-color: #9292ed;
 animation-name: ${breatheAnimation};
 animation-duration: 2s;
 animation-iteration-count: infinite;
 animation-timing-function: linear;
`

const StyledSelectKeyframes = styled(SelectKeyframes)`
  display: block;
  margin-bottom: 40px;
`

const StyledVideoUpload = styled.video`
display: block;
margin: 2rem auto 0 auto;
width: 85%;
height: auto;
max-height: 60vh;
border-radius: 10px;
`

const Quote = styled.h2`
  
`

const UploadLabel = styled.label`
margin: 1rem;
background-color: #3A36E7;
border-radius: 5px;
color: #FFFFFF;
border: none;
padding: 5px 5px;

&:hover {
  background-color: #2B28B2;
}
`

const HiddenFileInput = styled.input`
  display: none;
`