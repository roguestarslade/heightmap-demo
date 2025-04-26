export class InputHandler {
  constructor() {
    this.mouse = { x: 0, y: 0, down: false };
    this.rotation = { x: 0, y: 0 };

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && !this.isUIElement(e.target)) {
        this.mouse.down = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.down = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mouse.down) {
        let deltaX = (e.movementX / window.innerWidth) * Math.PI;
        let deltaY = (e.movementY / window.innerHeight) * Math.PI;
        this.rotation.x += deltaY;
        this.rotation.y += deltaX;
      }
    });
  }

  getRotation() {
    return this.rotation;
  }

  isUIElement(target) {
    return target.closest('#ui') || target.closest('#joystick');
  }
}
