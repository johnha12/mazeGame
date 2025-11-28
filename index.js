const {
  Engine, 
  Render, 
  Runner, 
  World, 
  Bodies, 
  Body,
  Events,
  MouseConstraint, 
  Mouse 
} = Matter;   // script tag added entire Matter library

const cellsHorizontal = 20;
const cellsVertical = 14;
const width = window.innerWidth;    // note square maze < complicated rectangle
const height = window.innerHeight;   // later will span device height
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

// boilerplate code:
const engine = Engine.create();
engine.world.gravity.y = 0;  // disable gravity
const {world} = engine;     // world got created w/ engine
const render = Render.create({
  element: document.body,  // add additional body element
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// maybe good for mobile?
World.add(world, MouseConstraint.create(engine, {
  mouse: Mouse.create(render.canvas)
}));

// walls
const walls = [
  Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
  Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
  Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
  Bodies.rectangle(width, height/2, 2, height, {isStatic: true})
];

World.add(world, walls);

// maze generation, first 3x3 array

const shuffle = (arr)=> {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  
  return arr
};

const grid = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal - 1).fill(false))

const horizontals = Array(cellsVertical - 1)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false))

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
  //if already visited [row, column], then return
  if (grid[row][column]) {
    return;
  }

  //mark this cell as visited
  grid[row][column] = true;

  //assemble randomly-ordered list of neighbors
  const neighbors = shuffle([   // up, right, down, left
    [row-1, column, "up"],
    [row, column+1, "right"],
    [row+1, column, "down"],
    [row, column-1, "left"]
  ]);

  //for each neighbor...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    // see if each neighbor is out of bounds
    if (nextRow < 0 || nextRow >= cellsVertical ||nextColumn < 0 || nextColumn >= cellsHorizontal) {
      continue;
    }

    //if already visited neighbor, continued to next
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // remove wall from vertical or horizontal
    if (direction === "left") {
      verticals[row][column-1] = true;
    } else if (direction ==="right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row-1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  // visit next cell
};
// backtrack? exit when all visited?

stepThroughCell(startRow,startColumn)

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    };
    const wall = Bodies.rectangle(
      (columnIndex * unitLengthX) + (unitLengthX / 2),
      (rowIndex * unitLengthY) + unitLengthY,
      unitLengthX,
      5,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "white"
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "white"
        }
      }
    );
    World.add(world, wall);
  });
});

//goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {fillStyle: "green"}
  }
);

World.add(world, goal);

//ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius,
  {
    label: "ball",
    render: {fillStyle: "blue"}
  }
);

World.add(world, ball);

document.addEventListener("keydown", event => { // starting to derail from tutorial
  const {x, y} = ball.velocity;
  if (event.code === "KeyW") {  //up
    Body.setVelocity(ball, {x, y: y - 5});
  }
  if (event.code === "KeyA") {  //left
    Body.setVelocity(ball, {x: x - 5, y});
  }
  if (event.code === "KeyS") {  //down
    Body.setVelocity(ball, {x, y: y + 5});
  }
  if (event.code === "KeyD") {  //right
    Body.setVelocity(ball, {x: x + 5, y});
  }
});


// win condition

Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(collision => {
    const labels = ["ball", "goal"];
    if (labels.includes(collision.bodyA.label)
    && labels.includes(collision.bodyB.label)) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
          Body.set(body, {
            density: 0.01,        // heavier
            friction: 0.8,        // sliding resistance
            frictionAir: 0.2,     // slows velocity over time
            // restitution: 0,       // no bouncing
            inertia: 20     // prevents tipping/spinning (optional)
          });
        }
      });
    }
  });
});