// This class conatains the information, that is to be shared to other
// clients as well and the server

class PlayerInfo {
  constructor(playerDetails, socketId, settings) {
    this.socketId = socketId;
    this.databaseUserId = playerDetails.id || "anonymous";
    this.name = playerDetails.name;
    this.color = this.getRandomColor();
    this.locX = Math.floor(Math.random() * settings.canvasWidth);
    this.locY = Math.floor(Math.random() * settings.canvasHeight);
    this.radius = settings.defaultRadius;
    this.score = 0;
    this.orbsAbsorbed = 0;
  }

  getRandomColor() {
    // Making sure that the orb is not too black
    const red = Math.floor(Math.random() * 200 + 50);
    const green = Math.floor(Math.random() * 200 + 50);
    const blue = Math.floor(Math.random() * 200 + 50);

    return `rgb(${red},${green},${blue})`;
  }
}

module.exports = PlayerInfo;
