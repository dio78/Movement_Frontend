const findAngles = (keypoints) => {

  const [nose, leftEye, rightEye, leftEar, rightEar, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle] = keypoints;

  const findAngle = (point1, vertexPoint, point2) => {
    const vertexY = vertexPoint.y
    const vertexX = vertexPoint.x

    const firstAngle = Math.atan2(point1.y - vertexY, point1.x - vertexX)
    const secondAngle = Math.atan2(point2.y - vertexY, point2.x - vertexX)

    const angleRadians = secondAngle-firstAngle;

    const angle = angleRadians * 180 / Math.PI;

    console.log(angle)
    newArray.push(angle);
  }

  const angleGroups = [[rightWrist, rightElbow, rightShoulder], [rightElbow, rightShoulder, rightHip], [leftWrist, leftElbow, leftShoulder], [leftElbow, leftShoulder, leftHip]]

  const newArray=[];

  angleGroups.forEach((group) => {
    findAngle(group[0], group[1], group[2], group[3]);
  })

  return newArray;

}

export default findAngles;