const normalizeKeypoints = (keypoints, imageWidth, imageHeight, intrinsicWidth, intrinsicHeight) => {
  const widthRatio = imageWidth / intrinsicWidth;
  const heightRatio = imageHeight / intrinsicHeight;

  keypoints.forEach(keypoint => {
    keypoint.x = keypoint.x * widthRatio;
    keypoint.y = keypoint.y * heightRatio;
  });
};

export default normalizeKeypoints;