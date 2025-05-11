const canvas = document.getElementById('bg_canvas');
const ctx = canvas.getContext('2d');

function fit_canvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

fit_canvas();
window.addEventListener('resize', fit_canvas);

const moving_elements = [];
const start_time = Date.now();
const max_time = 10 * 60 * 1000;
const max_speed_multiplier = 2;
const base_speed = 0.44;

function get_current_speed() {
  const elapsed = Date.now() - start_time;
  const progress = Math.min(elapsed / max_time, 1);
  return base_speed * (1 + (max_speed_multiplier - 1) * progress);
}

window.addEventListener('load', () => {
  const center_x = window.innerWidth / 2;
  const layout = [
    { id: 'icon', y: window.innerHeight * 0.4 },
    { id: 'title', y: window.innerHeight * 0.5 },
    { id: 'description', y: window.innerHeight * 0.6 },
  ];

  layout.forEach(({ id, y }) => {
    const el = document.getElementById(id);
    const rect = el.getBoundingClientRect();

    const x = center_x;
    el.style.left = `${x - rect.width / 2}px`;
    el.style.top = `${y - rect.height / 2}px`;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5;

    moving_elements.push({
      el,
      x,
      y,
      width: rect.width,
      height: rect.height,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed
    });
  });

  requestAnimationFrame(animate);
});

function update_positions() {
  const speed_factor = get_current_speed();

  moving_elements.forEach((obj) => {
    obj.x += obj.dx * speed_factor;
    obj.y += obj.dy * speed_factor;

    const half_w = obj.width / 2;
    const half_h = obj.height / 2;

    if (obj.x - half_w < 0 || obj.x + half_w > canvas.width) {
      obj.dx *= -1;
      obj.x = Math.max(half_w, Math.min(canvas.width - half_w, obj.x));
    }

    if (obj.y - half_h < 0 || obj.y + half_h > canvas.height) {
      obj.dy *= -1;
      obj.y = Math.max(half_h, Math.min(canvas.height - half_h, obj.y));
    }

    obj.el.style.left = `${obj.x - half_w}px`;
    obj.el.style.top = `${obj.y - half_h}px`;
  });
}

function check_collisions() {
  for (let i = 0; i < moving_elements.length; i++) {
    for (let j = i + 1; j < moving_elements.length; j++) {
      const a = moving_elements[i];
      const b = moving_elements[j];

      const a_left = a.x - a.width / 2;
      const a_right = a.x + a.width / 2;
      const a_top = a.y - a.height / 2;
      const a_bottom = a.y + a.height / 2;

      const b_left = b.x - b.width / 2;
      const b_right = b.x + b.width / 2;
      const b_top = b.y - b.height / 2;
      const b_bottom = b.y + b.height / 2;

      const is_colliding =
        a_left < b_right &&
        a_right > b_left &&
        a_top < b_bottom &&
        a_bottom > b_top;

      if (is_colliding) {
        [a.dx, b.dx] = [b.dx * 0.9, a.dx * 0.9];
        [a.dy, b.dy] = [b.dy * 0.9, a.dy * 0.9];
        a.x += a.dx;
        a.y += a.dy;
        b.x += b.dx;
        b.y += b.dy;
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update_positions();
  check_collisions();
  requestAnimationFrame(animate);
}
