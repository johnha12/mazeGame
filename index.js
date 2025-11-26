const {
  Engine, 
  Render, 
  Runner, 
  World, 
  Bodies, 
  MouseConstraint, 
  Mouse 
} = Matter;   // script tag added entire Matter library

const cells = 3;
const width = 600;    // note square maze < complicated rectangle
const height = 600;   // later will span device height
const unitLength = width / cells;

// boilerplate code:
const engine = Engine.create();
const {world} = engine;     // world got created w/ engine
const render = Render.create({
  element: document.body,  // add additional body element
  engine: engine,
  options: {
    wireframes: true,
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

    return arr
  }
};

const grid = Array(cells)
.fill(null)
.map(() => Array(cells).fill(false));

const verticals = Array(cells)
.fill(null)
.map(() => Array(cells - 1).fill(false))

const horizontals = Array(cells - 1)
.fill(null)
.map(() => Array(cells).fill(false))

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

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
    if (nextRow < 0 || nextRow >= cells ||nextColumn < 0 || nextColumn >= cells) {
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
      (columnIndex * unitLength) + (unitLength / 2),
      (rowIndex * unitLength) + unitLength,
      unitLength,
      5,
      {isStatic: true}
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
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      5,
      unitLength,
      {isStatic: true}
    );
    World.add(world, wall);
  });
});

//goal
const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * 0.7,
  unitLength * 0.7,
  {isStatic: true}
);

World.add(world, goal);

//ball
const ball = Bodies.circle(
  unitLength / 2,
  unitLength / 2,
  unitLength / 4,
);

World.add(world, ball);