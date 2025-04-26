export class Joystick {
  constructor() {
    this.joystick = document.getElementById('joystick');
    this.stick = document.getElementById('stick');
    this.center = { x: 60, y: 60 };
    this.radius = 60;
    this.value = { x: 0, y: 0 };
    this.strength = 0.0; // 🔥 NEW - strength from center

    this.isDragging = false;

    this.joystick.addEventListener('pointerdown', (e) => this.startDrag(e));
    window.addEventListener('pointermove', (e) => this.onDrag(e));
    window.addEventListener('pointerup', () => this.endDrag());
  }

  startDrag(e) {
    this.isDragging = true;
    this.updateStick(e);
  }

  onDrag(e) {
    if (this.isDragging) {
      this.updateStick(e);
    }
  }

  endDrag() {
    this.isDragging = false;
    // Do NOT reset stick position
    // Do NOT reset value or strength
  }

  updateStick(e) {
    const rect = this.joystick.getBoundingClientRect();
    const dx = e.clientX - (rect.left + this.center.x);
    const dy = e.clientY - (rect.top + this.center.y);

    const dist = Math.min(Math.hypot(dx, dy), this.radius);
    const angle = Math.atan2(dy, dx);

    const x = dist * Math.cos(angle);
    const y = dist * Math.sin(angle);

    this.stick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

    this.value.x = x / this.radius;
    this.value.y = y / this.radius;

    this.strength = dist / this.radius; // 🔥 NEW: normalized distance (0 to 1)
  }

  getValue() {
    return this.value;
  }

  getStrength() {
    return this.strength;
  }
}
