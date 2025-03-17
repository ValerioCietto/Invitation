const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.backgroundColor = "darkblue";

const spaceshipImage = new Image();
spaceshipImage.src = "spaceship.png";

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

function spawnStars() {
  for (let i = 0; i < 5; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2,
      brightness: Math.random() * 155 + 100,
    });
  }
}

function updateStars() {
  stars.forEach((star, index) => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
      star.brightness = Math.random() * 155 + 100;
    }
  });
}

function drawStars() {
  stars.forEach((star) => {
    ctx.fillStyle = `rgb(${star.brightness}, ${star.brightness}, ${star.brightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

function createButtons() {
  const buttons = [
    {
      text: "+10 Radius (5§)",
      cost: 5,
      action: () => {
        if (money >= 5) {
          spaceship.radius += 10;
          money -= 5;
          pingSound.currentTime = 0;
          pingSound.play();
        }
      },
    },
    {
      text: "+1 Ray (5§)",
      cost: 5,
      action: () => {
        if (money >= 5) {
          spaceship.rays += 1;
          money -= 5;
          pingSound.currentTime = 0;
          pingSound.play();
        }
      },
    },
    {
      text: "Ray Power +1 (5§)",
      cost: 500,
      action: () => {
        if (money >= 5) {
          spaceship.rayPower += 0.2;
          money -= 5;
          pingSound.currentTime = 0;
          pingSound.play();
        }
      },
    },
    {
      text: "Final Weapon (1000§)",
      cost: 1000,
      action: () => {
        if (money >= 1000) {
          spaceship.finalWeapon = true;
          money -= 1000;
          pingSound.currentTime = 0;
          pingSound.play();
        }
      },
    },
  ];

  buttons.forEach((btn, i) => {
    const button = document.createElement("button");
    button.innerText = btn.text;
    button.style.position = "fixed";
    button.style.bottom = "10px";
    button.style.left = `${10 + i * 130}px`;
    button.onclick = btn.action;
    document.body.appendChild(button);
  });
}

createButtons();

function drawSpaceship() {
  ctx.beginPath();
  ctx.arc(spaceship.x, spaceship.y, spaceship.radius, 0, Math.PI * 2);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.closePath();

  if (spaceshipImage.complete) {
    ctx.drawImage(spaceshipImage, spaceship.x - 25, spaceship.y - 25, 50, 50);
  } else {
    spaceshipImage.onload = () => {
      ctx.drawImage(spaceshipImage, spaceship.x - 25, spaceship.y - 25, 50, 50);
    };
  }
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

function drawLightning(x1, y1, x2, y2) {
  let segments = 5;
  let offset = 20;
  let points = [{ x: x1, y: y1 }];

  for (let i = 1; i < segments; i++) {
    let t = i / segments;
    let nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * offset;
    let ny = y1 + (y2 - y1) * t + (Math.random() - 0.5) * offset;
    points.push({ x: nx, y: ny });
  }
  points.push({ x: x2, y: y2 });

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.closePath();
}

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
      if (spaceship.finalWeapon) {
        drawLightning(spaceship.x, spaceship.y, asteroid.x, asteroid.y);
      } else {
        ctx.strokeStyle = "red";
        ctx.lineWidth = Math.max(1, spaceship.rayPower);
        ctx.beginPath();
        ctx.moveTo(spaceship.x, spaceship.y);
        ctx.lineTo(asteroid.x, asteroid.y);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.closePath();
      }

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

function drawHUD() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Killed: ${killCount} | Money: ${money}§`, 20, 30);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateStars();
  drawStars();
  drawSpaceship();
  drawAsteroids();
  drawHUD();
  checkLaserHits();
  requestAnimationFrame(gameLoop);
}

setInterval(checkLaserHits, 100);
gameLoop();
