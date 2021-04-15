// This file contains all the data about the canvas

// This function is called for every frame, and if the coordinates of the circle change
// then the circle starts to move
const draw = () => {
  // To draw the players circle in the canvas

  // Reseting the translate to default
  context.setTransform(1, 0, 0, 1, 0, 0);

  // Clearing the canvas prior to drawing the circle
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Clamp the camera to this connected player's circle
  const camX = -player.locX + canvas.width / 2;
  const camY = -player.locY + canvas.height / 2;
  // console.log("cam is" + camX, camY);
  context.translate(camX, camY);

  // Render all the players with their updated positions
  allPlayers.forEach((playerEl) => {
    // The beginPath() method begins a path, or resets the current path.
    context.beginPath();
    // The fillStyle method add color to the path
    context.fillStyle = playerEl.color;
    // Arc method creates a circle
    context.arc(playerEl.locX, playerEl.locY, playerEl.radius, 0, Math.PI * 2);
    // context.arc(200, 200, 10, 0, Math.PI * 2);
    context.fill();
    // Stroke properties for the path
    context.lineWidth = 3;
    context.strokeStyle = "#fff";
    context.stroke();
  });

  // Updating leaderboard and score board
  scoreSpan.textContent = player.score;
  let html = "";
  leaderboard.forEach((playerEl) => {
    html += `
    <li class="leaderboard__player">
    <span class="leaderboard__player__name">${playerEl.name}</span>
      <span class="leaderboard__player__score">${playerEl.score}</span>
      </li>
    `;
  });
  leaderboardList.innerHTML = html;

  // Render all the orbs from the orbArr
  orbArr.forEach((orb) => {
    context.beginPath();
    context.fillStyle = orb.color;
    context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
    context.fill();
  });

  // This method accepts a callback, which is called for every frame,
  // and updates if the animation has been changed
  // Generally, its called at 13-17fps for my browser
  requestAnimationFrame(draw);
};

// NOw, we need to listen to the mouse event, so that we can move our players circle
canvas.addEventListener("mousemove", (event) => {
  // The mosue position is given by client coordinates, not window coordinates
  const mousePosition = {
    x: event.clientX,
    y: event.clientY,
  };

  // The angleDeg is the angle in degrees between the cursor and the center of the canvas
  // which is nothing but the center of the player's circle
  const angleDeg =
    (Math.atan2(
      mousePosition.y - canvas.height / 2,
      mousePosition.x - canvas.width / 2
    ) *
      180) /
    Math.PI;

  // Checking the postion and the distance of the mouse wrt center of the canvas
  // Here, the xVector and yVector are the distance of the cursor to the center of the canvas
  // The xVectorand yVector values lies between 0 and 1
  if (angleDeg >= 0 && angleDeg < 90) {
    xVector = 1 - angleDeg / 90;
    yVector = -(angleDeg / 90);
  } else if (angleDeg >= 90 && angleDeg <= 180) {
    xVector = -(angleDeg - 90) / 90;
    yVector = -(1 - (angleDeg - 90) / 90);
  } else if (angleDeg >= -180 && angleDeg < -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = 1 + (angleDeg + 90) / 90;
  } else if (angleDeg < 0 && angleDeg >= -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = 1 - (angleDeg + 90) / 90;
  }

  // Add the vector details to the player object
  // Wea re also constantly updating the player's vector position
  player.xVector = xVector;
  player.yVector = yVector;
});
