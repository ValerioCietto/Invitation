const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let spaceship = { x: canvas.width / 2, y: canvas.height / 2, radius: 50 };
let asteroids = [];
let killCount = 0;

function spawnAsteroid() {
  let size = Math.random() * 20 + 20;
  asteroids.push({
    x: Math.random() * canvas.width,
    y: -size,
    size: size,
    speed: Math.random() * 3 + 1,
    redValue: 0,
  });
}

setInterval(spawnAsteroid, 1000);

document.addEventListener("mousemove", (event) => {
  spaceship.x = event.clientX;
  spaceship.y = event.clientY;
});

function drawSpaceship() {
  ctx.beginPath();
  ctx.arc(spaceship.x, spaceship.y, spaceship.radius, 0, Math.PI * 2);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.closePath();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(spaceship.x, spaceship.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawAsteroids() {
  asteroids.forEach((asteroid, index) => {
    ctx.fillStyle = `rgb(${asteroid.redValue}, 0, 0)`;
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    asteroid.y += asteroid.speed;

    if (asteroid.y - asteroid.size > canvas.height) {
      asteroids.splice(index, 1);
    }
  });
}

function checkLaserHits() {
  asteroids.forEach((asteroid, index) => {
    let dx = asteroid.x - spaceship.x;
    let dy = asteroid.y - spaceship.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < spaceship.radius) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(spaceship.x, spaceship.y);
      ctx.lineTo(asteroid.x, asteroid.y);
      ctx.stroke();
      ctx.closePath();

      asteroid.size *= 0.9;
      asteroid.redValue = Math.min(255, asteroid.redValue + 25);

      if (asteroid.size < 10) {
        asteroids.splice(index, 1);
        killCount++;
        if (killCount % 10 === 0) {
          spaceship.radius += 1;
        }
      }
    }
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSpaceship();
  drawAsteroids();
  checkLaserHits();
  requestAnimationFrame(gameLoop);
}

setInterval(checkLaserHits, 100);
gameLoop();
