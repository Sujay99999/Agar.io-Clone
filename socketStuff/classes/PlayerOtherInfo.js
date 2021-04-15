// This class contains some information about the current
// player that is only stored on the server side

class PlayerOtherInfo {
  constructor(settings) {
    this.xVector = 0;
    this.yVector = 0;
    this.speed = settings.defaultSpeed;
    this.zoom = settings.defaultZoom;
  }
}

module.exports = PlayerOtherInfo;
