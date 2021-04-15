// This is the class which creates the orb and is being rendered
// on the screen.

class Orb {
  constructor(settings) {
    this.color = this.getRandomColor();
    this.locX = Math.floor(Math.random() * settings.canvasWidth);
    this.locY = Math.floor(Math.random() * settings.canvasHeight);
    this.radius = 5;
  }

  getRandomColor() {
    // Making sure that the orb is not too black
    const red = Math.floor(Math.random() * 200 + 50);
    const green = Math.floor(Math.random() * 200 + 50);
    const blue = Math.floor(Math.random() * 200 + 50);

    return `rgb(${red},${green},${blue})`;
  }
}

module.exports = Orb;
