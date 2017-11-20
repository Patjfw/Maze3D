import "babel-polyfill";

import maze3D from './drawMaze3D.js'

const ACTIONS = [
    {x:0, y:-1}, // UP
    {x:0, y:1},  // DOWN
    {x:-1, y:0}, // LEFT
    {x:1 ,y:0}   // RIGHT
]

let sampleMaze = {
  sample1 : {
    maze: [
      [0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,0,1,1,1,0],
      [0,0,0,0,1,1,1,1,0,0,0],
      [0,1,1,0,0,1,0,1,1,0,0],
      [0,0,1,1,1,1,0,1,0,1,0],
      [0,1,1,0,0,1,1,1,0,1,0],
      [0,0,1,0,1,0,1,1,1,1,0],
      [0,1,1,1,1,0,0,0,1,0,0],
      [0,0,1,0,0,0,1,1,1,1,0],
      [0,1,1,1,1,1,1,0,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0]
    ],
    startPoint: {x:1, y:9},
    endPoint: {x:9, y:1}
  }
}

class Point {
  constructor(x, y, parent){
    this.x = x;
    this.y = y;
    this.parent = parent;
  }

  takeAction (action) {
    return {x: this.x + action.x,
            y: this.y + action.y}
  }
}

class AstarPoint extends Point{
  constructor(x, y, parent, g, h){
    super(x, y, parent);
    this._g = g;
    this._h = h;
    this.f = this._g + this._h;
  }

  get g(){
    return this._g;
  }

  set g(val){
    this._g = val;
    this.f = this._g + this._h;
  }

  get h(){
    return this._h;
  }

  set h(val){
    this._h = val;
    this.f = this._g + this._h;
  }
}

let validatePos = function (maze, pos) {
  if(maze[pos.y][pos.x] === 1){
    return true;
  }else{
    return false;
  }
}

let backTracking = function(point){
  var trackingArr = [{x: point.x, y:point.y}];
  while(point.parent){
    trackingArr.unshift({x:point.parent.x, y:point.parent.y})
    point = point.parent;
  }
  return trackingArr;
}

let visitedTrace = [];

let search = function(maze, type){
  visitedTrace = [];
  // for visited
  var copiedMaze = JSON.parse(JSON.stringify(maze.maze));
  var queue = [];
  queue.push(new Point(maze.startPoint.x, maze.startPoint.y, null));

  while(queue.length !== 0){
    if(type === 'bfs'){
      var point = queue.shift();
    }else if(type === 'dfs'){
      var point = queue.pop();
    }
    copiedMaze[point.y][point.x] = 0
    visitedTrace.push({x:point.x, y:point.y});
    if(point.x === maze.endPoint.x && point.y === maze.endPoint.y){
      console.log(`${type}, exit is reached`)
      return point;
    }

    for(let action of ACTIONS){
      var newPos = point.takeAction(action)
      if(validatePos(copiedMaze, newPos)){
        var newPoint = new Point(newPos.x, newPos.y, point);
        queue.push(newPoint);
      }
    }
  }
  return null;
}

let calManhattanDistance = function(p1, p2){
  return Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y)
}

let astar = function(maze){
  visitedTrace = [];
  // let copiedMaze = JSON.parse(JSON.stringify(maze.maze));
  let openList = [];
  let closedList = [];

  let point = new AstarPoint(maze.startPoint.x, maze.startPoint.y, null, 0, 0);
  point.h = calManhattanDistance(point, maze.endPoint);
  openList.push(point);

  while(openList.length !== 0){
    let q = openList.shift();
    visitedTrace.push({x:q.x, y:q.y});
    for(let action of ACTIONS){
      var newPos = q.takeAction(action)
      if(validatePos(maze.maze, newPos)){
        var newPoint = new AstarPoint(newPos.x, newPos.y, q, 0, 0);
        newPoint.g = q.g+1;
        newPoint.h = calManhattanDistance(newPoint, maze.endPoint);
        if(newPoint.x === maze.endPoint.x && newPoint.y === maze.endPoint.y){
          console.log("A*, exit is reached")
          visitedTrace.push({x:newPoint.x, y:newPoint.y});
          return newPoint;
        }

        let openSuccessor = openList.find((item)=>{
          if(item.x === newPoint.x && item.y === newPoint.y && item.f < newPoint.f){
            return item;
          }
        })

        if(openSuccessor){
          continue;
        }

        let closedSuccessor = closedList.find((item)=>{
          if(item.x === newPoint.x && item.y === newPoint.y && item.f < newPoint.f){
            return item;
          }
        })

        if(closedSuccessor){
          continue;
        }

        openList.push(newPoint)
      }
    }

    closedList.push(q);
    openList.sort(function(a, b){
      return a.f - b.f;
    })
  }
}

let DFSMazeGenerator = function(perfect=true, size=33, deleteNum=20){
  let mazeData = [];
  for (let i = 0; i < size; i++){
    mazeData[i] = []
    for (let j = 0; j < size; j++){
      mazeData[i][j] = 0;
    }
  }

  let row = 0
  while (row % 2 == 0) {
    row = Math.floor(Math.random()*(size-2))+1
  }

  let col = 0
  while (col % 2 == 0) {
    col = Math.floor(Math.random()*(size-2))+1
  }

  mazeData[row][col] = 1;
  recursion(row, col, mazeData);

  function shuffle(){
    let toShuffledArr = JSON.parse(JSON.stringify(ACTIONS));
    for (let i = toShuffledArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [toShuffledArr[i], toShuffledArr[j]] = [toShuffledArr[j], toShuffledArr[i]];
    }
    return toShuffledArr;
  }

  function recursion(row, col, mazeData){
    let actions = shuffle();
    for(let i = 0; i <actions.length; i++){
      if(actions[i].y !== 0){
        let nextRow = row + actions[i].y*2;
        if(nextRow <=0 || nextRow >= size-1){
          continue
        }

        if(mazeData[nextRow][col] !== 1){
          mazeData[nextRow][col] = 1
          mazeData[nextRow - actions[i].y][col] = 1
          recursion(nextRow, col, mazeData)
        }
      }

      if(actions[i].x !== 0){
        let nextCol = col + actions[i].x*2;
        if(nextCol <=0 || nextCol >= size-1){
          continue
        }

        if(mazeData[row][nextCol] !== 1){
          mazeData[row][nextCol] = 1
          mazeData[row][nextCol - actions[i].x] = 1
          recursion(row, nextCol, mazeData)
        }
      }
    }
  }

  function setEntranceExit(mazeData){
    let minDis = Math.round(size*1.2)
    function setPoint() {
      let tmpX = Math.floor(Math.random()*(size-2)) +1;
      let tmpY = Math.floor(Math.random()*(size-2)) +1;
      return {x: tmpX, y:tmpY}
    }

    var done = false
    var entrance, exit;
    while(!done){
      entrance = setPoint();
      exit = setPoint();
      if(calManhattanDistance(entrance, exit) >= minDis &&
        mazeData[entrance.y][entrance.x] === 1 &&
        mazeData[exit.y][exit.x] === 1
      ){
        done = true;
      }
    }
    return [entrance, exit]
  }

  if(perfect === false){
    while(deleteNum>0){
      let tmpX = Math.floor(Math.random()*(size-2)) +1;
      let tmpY = Math.floor(Math.random()*(size-2)) +1;
      if(mazeData[tmpY][tmpX] === 0){
        mazeData[tmpY][tmpX] = 1
        deleteNum --;
      }
    }
  }

  var points = setEntranceExit(mazeData)
  return {
    maze: mazeData,
    startPoint: points[0],
    endPoint: points[1]
  }
}

let endPoint, path, maze, usedMap



let solveBtn = document.getElementById('solve');
let generateBtn = document.getElementById('generate');
let selectedMaze = document.getElementById('selectedMaze');
let selectedAlgo = document.getElementById("algorithm");

generateBtn.addEventListener('click', function(){
  if(selectedMaze.value === 'default'){
    usedMap = sampleMaze.sample1;
  }else if(selectedMaze.value === 'perfect'){
    usedMap = DFSMazeGenerator(true);
  }else if(selectedMaze.value === 'braid'){
    usedMap = DFSMazeGenerator(false);
  }

  if(maze){
    maze.cleanScene();
    maze = null;
  }
  maze = maze3D("mazeCanvas", usedMap);
});

solveBtn.addEventListener('click', function(){
    if(selectedAlgo.value === 'bfs'){
      endPoint = search(usedMap, 'bfs')
    }else if(selectedAlgo.value === 'dfs'){
      endPoint = search(usedMap, 'dfs')
    }else if(selectedAlgo.value === 'astar'){
      endPoint = astar(usedMap)
    }

    path = backTracking(endPoint);
    maze.rebuildScene();
    maze.fixTheCamera().then(function(){
      maze.drawTrace(visitedTrace).then(function(){
        maze.followThePath(path)
      })
    })
})
