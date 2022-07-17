import * as poseDetection from '@tensorflow-models/pose-detection';

export const setupTensor = (video, detectorRef) => {

  
  const movenetLoad = async (detectorRef) => {

    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox,
      multiPoseMaxDimension: 512
    };

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    detectorRef.current = detector;
  }

};

export const detect = async (detector, videoRef, canvasRef) => {
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
    // normalizeKeypoints(pose[0].keypoints, 640, 360.56, otherVidRef.current.videoWidth, otherVidRef.current.videoHeight)

    drawSkeleton(canvasRef, pose);

    if(!analyzed && videoRef.current) {
      newArray.push(pose[0].keypoints);
    }
  }
};