const Orb = require("./classes/Orb");
const io = require("./../server.js").io;

const checkForOrbCollisions = (pInfo, pOtherInfo, orbArr, settings) => {
  return new Promise((resolve, reject) => {
    //ORB COLLISIONS
    orbArr.forEach((orb, i) => {
      // console.log("CHECK FOR COLLISIONS")
      // AABB Test(square)  - Axis-aligned bounding boxes
      if (
        pInfo.locX + pInfo.radius + orb.radius > orb.locX &&
        pInfo.locX < orb.locX + pInfo.radius + orb.radius &&
        pInfo.locY + pInfo.radius + orb.radius > orb.locY &&
        pInfo.locY < orb.locY + pInfo.radius + orb.radius
      ) {
        // Pythagoras test(circle)
        const distance = Math.sqrt(
          (pInfo.locX - orb.locX) * (pInfo.locX - orb.locX) +
            (pInfo.locY - orb.locY) * (pInfo.locY - orb.locY)
        );
        if (distance < pInfo.radius + orb.radius) {
          //COLLISION!!!
          pInfo.score += 1;
          pInfo.orbsAbsorbed += 1;

          if (pOtherInfo.zoom > 1) {
            pOtherInfo.zoom -= 0.001;
          }
          pInfo.radius += 0.25;
          if (pOtherInfo.speed < -0.01) {
            pOtherInfo.speed += 0.01;
          } else if (pOtherInfo.speed > 0.01) {
            pOtherInfo.speed -= 0.01;
          }
          // console.log("new speed is " + pOtherInfo.speed);
          // we have to keep orbArr updated for new players
          // we just dont want to push them out more than we have to

          // BUG: the promise gets resolved, if the player intersects any orb
          // but not checking for multiple intersections
          orbArr.splice(i, 1, new Orb(settings));
          // Here, the scores and the radius gets updated real time
          resolve(i);
        }
      }
    });
    // if we got out of the loop, there was no collision.
    // Reject promise
    reject("no collision between player an orb");
  });
};

const checkForPlayerCollisions = (pInfo, pOtherInfo, players) => {
  return new Promise((resolve, reject) => {
    //PLAYER COLLISIONS
    players.forEach((currPlayer, i) => {
      if (currPlayer.socketId === pInfo.socketId) return;
      // AABB Test - Axis-aligned bounding boxes
      if (
        pInfo.locX + pInfo.radius + currPlayer.radius > currPlayer.locX &&
        pInfo.locX < currPlayer.locX + pInfo.radius + currPlayer.radius &&
        pInfo.locY + pInfo.radius + currPlayer.radius > currPlayer.locY &&
        pInfo.locY < currPlayer.locY + pInfo.radius + currPlayer.radius
      ) {
        // Pythagoras test
        const distance = Math.sqrt(
          (pInfo.locX - currPlayer.locX) * (pInfo.locX - currPlayer.locX) +
            (pInfo.locY - currPlayer.locY) * (pInfo.locY - currPlayer.locY)
        );
        if (distance < pInfo.radius + currPlayer.radius) {
          //COLLISION!!
          if (pInfo.radius > currPlayer.radius) {
            // ENEMY DEATH
            let collisionData = updateScores(pInfo, currPlayer);
            if (pOtherInfo.zoom > 1) {
              pOtherInfo.zoom -= currPlayer.radius * 0.25 * 0.001;
            }
            players.splice(i, 1);

            // Updating the scores in real time
            resolve(collisionData);
          }
          // The else case is not required, because all the players positions are
          // updated very quickly, so that,it feels like no change
        }
      }
    });
    reject("no collision between players");
  });
};

function updateScores(killer, killed) {
  killer.score += killed.score + 10;
  killer.playersAbsorbed += 1;
  killed.alive = false;
  killer.radius += killed.radius * 0.25;
  return {
    died: killed,
    killedBy: killer,
  };
}

module.exports = { checkForOrbCollisions, checkForPlayerCollisions };
