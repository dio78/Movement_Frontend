const normalizeKeypoints = (keypoints, imageWidth, imageHeight, intrinsicWidth, intrinsicHeight) => {
  const widthRatio = imageWidth / intrinsicWidth;
  const heightRatio = imageHeight / intrinsicHeight;
  
  const aspectRatio = intrinsicWidth / intrinsicHeight;


  keypoints.forEach(keypoint => {
    keypoint.x = keypoint.x * 1;
    keypoint.y = keypoint.y * 1;
  });
};

export default normalizeKeypoints;