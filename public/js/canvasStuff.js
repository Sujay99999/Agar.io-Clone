// This file contains all the data about the canvasObj.canvas
console.log("canvasstuff loaded");
// This function is called for every frame, and if the coordinates of the circle change
// then the circle starts to move
export const draw = (globalObj, domElements, canvasObj) => {
  // console.log(globalObj, domElements, canvasObj);
  // To draw the players circle in the canvasObj.canvas

  // Reseting the translate to default
  canvasObj.context.setTransform(1, 0, 0, 1, 0, 0);

  // Clearing the canvasObj.canvas prior to drawing the circle
  canvasObj.context.clearRect(
    0,
    0,
    canvasObj.canvas.width,
    canvasObj.canvas.height
  );

  // console.log(globalObj.currPlayer);
  // Clamp the camera to this connected player's circle
  const camX = -globalObj.currPlayer.locX + canvasObj.canvas.width / 2;
  const camY = -globalObj.currPlayer.locY + canvasObj.canvas.height / 2;
  // console.log("cam is" + camX, camY);
  canvasObj.context.translate(camX, camY);

  // Render all the players with their updated positions
  globalObj.allPlayers.forEach((playerEl) => {
    // The beginPath() method begins a path, or resets the current path.
    canvasObj.context.beginPath();
    // The fillStyle method add color to the path
    canvasObj.context.fillStyle = playerEl.color;
    // Arc method creates a circle
    canvasObj.context.arc(
      playerEl.locX,
      playerEl.locY,
      playerEl.radius,
      0,
      Math.PI * 2
    );
    // canvasObj.context.arc(200, 200, 10, 0, Math.PI * 2);
    canvasObj.context.fill();
    // Stroke properties for the path
    canvasObj.context.lineWidth = 3;
    canvasObj.context.strokeStyle = "#fff";
    canvasObj.context.stroke();
  });

  // Updating leaderboard and score board
  domElements.scoreSpan.textContent = globalObj.currPlayer.score;
  let html = "";
  globalObj.leaderboard.forEach((playerEl) => {
    html += `
    <li class="leaderboard__player">
    <span class="leaderboard__player__name">${playerEl.name}</span>
      <span class="leaderboard__player__score">${playerEl.score}</span>
      </li>
    `;
  });
  domElements.leaderboardList.innerHTML = html;

  // Render all the orbs from the orbArr
  globalObj.orbArr.forEach((orb) => {
    canvasObj.context.beginPath();
    canvasObj.context.fillStyle = orb.color;
    canvasObj.context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
    canvasObj.context.fill();
  });

  // console.log(globalObj, domElements, canvasObj);
  // This method accepts a callback, which is called for every frame,
  // and updates if the animation has been changed
  // Generally, its called at 13-17fps for my browser
  requestAnimationFrame(function (_) {
    draw(globalObj, domElements, canvasObj);
  });
};

// NOw, we need to listen to the mouse event, so that we can move our players circle
export const mouseListner = (globalObj, domElements, canvasObj) => {
  canvasObj.canvas.addEventListener("mousemove", (event) => {
    console.log("mouse is moved");
    // The mosue position is given by client coordinates, not window coordinates
    const mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };

    // The angleDeg is the angle in degrees between the cursor and the center of the canvasObj.canvas
    // which is nothing but the center of the player's circle
    const angleDeg =
      (Math.atan2(
        mousePosition.y - canvasObj.canvas.height / 2,
        mousePosition.x - canvasObj.canvas.width / 2
      ) *
        180) /
      Math.PI;

    // Checking the postion and the distance of the mouse wrt center of the canvasObj.canvas
    // Here, the xVector and yVector are the distance of the cursor to the center of the canvasObj.canvas
    // The xVectorand yVector values lies between 0 and 1
    let xVector, yVector;
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
    globalObj.currPlayer.xVector = xVector;
    globalObj.currPlayer.yVector = yVector;
  });
};
