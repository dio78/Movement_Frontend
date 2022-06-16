const normalizeKeypoints = (keypoints, imageWidth, imageHeight, intrinsicWidth, intrinsicHeight) => {
  const widthRatio = imageWidth / intrinsicWidth;
  const heightRatio = imageHeight / intrinsicHeight;
  
  const aspectRatio = intrinsicWidth / intrinsicHeight;
  console.log(aspectRatio)
  console.log(keypoints)


  keypoints.forEach(keypoint => {
    keypoint.x = keypoint.x * .85;
    keypoint.y = keypoint.y * .85;
  });
};

export default normalizeKeypoints;