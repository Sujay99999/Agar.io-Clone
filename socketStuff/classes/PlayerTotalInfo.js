// This class contains the total available info about the player
// that is stored in the server

class PlayerTotalInfo {
  constructor(socketId, playerInfo, playerOtherInfo) {
    this.socketId = socketId;
    this.playerInfo = playerInfo;
    this.playerOtherInfo = playerOtherInfo;
  }
}

module.exports = PlayerTotalInfo;
