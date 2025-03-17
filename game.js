const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.backgroundColor = "darkblue";

let spaceship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 50,
  rays: 1,
  rayPower: 1,
  finalWeapon: false,
};
let asteroids = [];
let stars = [];
let killCount = 0;
let money = 0;
let tutorialStartTime = Date.now();

let spawnRate = 1;
let spawnInterval = 1000;
let asteroidSpawnTimer;

const boomSound = new Audio("boom.wav");
const pingSound = new Audio("ping.wav");

function spawnAsteroids() {
  for (let i = 0; i < spawnRate; i++) {
    let size = Math.random() * 20 + 20;
    asteroids.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.1),
      size: size,
      speed: Math.random() * 3 + 1,
      redValue: 0,
    });
  }
}

function adjustSpawnRate() {
  if (killCount % 10 === 0 && spawnInterval > 20) {
    spawnInterval = Math.max(20, spawnInterval - 10);
    restartAsteroidSpawn();
  }
  if (killCount % 100 === 0 && spawnRate < 20) {
    spawnRate = Math.min(20, spawnRate + 1);
  }
}

function restartAsteroidSpawn() {
  clearInterval(asteroidSpawnTimer);
  asteroidSpawnTimer = setInterval(spawnAsteroids, spawnInterval);
}

restartAsteroidSpawn();
setInterval(spawnStars, 5000);

document.addEventListener("mousemove", (event) => {
  spaceship.x = event.clientX;
  spaceship.y = event.clientY;
});

document.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length > 0) {
      spaceship.x = event.touches[0].clientX;
      spaceship.y = event.touches[0].clientY;
    }
  },
  { passive: false }
);

// ... resto del codice invariato ...

function checkLaserHits() {
  let currentRays = 0;
  const sortedAsteroids = asteroids.slice().sort((a, b) => a.size - b.size);

  for (const element of sortedAsteroids) {
    if (currentRays >= spaceship.rays) break;

    const asteroid = element;
    let dx = asteroid.x - spaceship.x;
    let dy = asteroid.y - spaceship.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < spaceship.radius) {
      let color;
      if (spaceship.finalWeapon) {
        color = "white";
      } else {
        let intensity = Math.min(255, spaceship.rayPower * 25);
        color = `rgb(255, ${255 - intensity}, ${255 - intensity})`;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = spaceship.finalWeapon
        ? 100
        : Math.max(1, spaceship.rayPower);
      ctx.beginPath();
      ctx.moveTo(spaceship.x, spaceship.y);
      ctx.lineTo(asteroid.x, asteroid.y);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.closePath();

      let damage = spaceship.finalWeapon ? 100 : spaceship.rayPower;
      asteroid.size -= damage * 0.1;
      asteroid.redValue = Math.min(255, asteroid.redValue + 25);
      currentRays++;

      if (asteroid.size < 10) {
        let index = asteroids.indexOf(asteroid);
        if (index > -1) {
          asteroids.splice(index, 1);
          killCount++;
          money++;
          adjustSpawnRate();
          boomSound.currentTime = 0;
          boomSound.play();
        }
      }
    }
  }
}

// ... resto del codice invariato ...
