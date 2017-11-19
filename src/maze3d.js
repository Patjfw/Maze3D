import "babel-polyfill";

import maze3D from './drawMaze3D.js'

const ACTIONS = {
    "UP": {x:0, y:-1},
    "DOWN": {x:0, y:1},
    "LEFT": {x:-1, y:0},
    "RIGHT": {x:1 ,y:0}
}

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

    for(let action of Object.keys(ACTIONS)){
      var newPos = point.takeAction(ACTIONS[action])
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
  // let copiedMaze = JSON.parse(JSON.stringify(maze.maze));
  let openList = [];
  let closedList = [];

  let point = new AstarPoint(maze.startPoint.x, maze.startPoint.y, null, 0, 0);
  point.h = calManhattanDistance(point, maze.endPoint);
  openList.push(point);

  while(openList.length !== 0){
    let q = openList.shift();
    visitedTrace.push({x:q.x, y:q.y});
    for(let action of Object.keys(ACTIONS)){
      var newPos = q.takeAction(ACTIONS[action])
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

let endPoint, path, maze

let solveBtn = document.getElementById('solve');
let generateBtn = document.getElementById('generate');
let selectedAlgo = document.getElementById("algorithm");

generateBtn.addEventListener('click', function(){
  maze = maze3D("mazeCanvas", sampleMaze.sample1);
});

solveBtn.addEventListener('click', function(){
    if(selectedAlgo.value === 'bfs'){
      endPoint = search(sampleMaze.sample1, 'bfs')
    }else if(selectedAlgo.value === 'dfs'){
      endPoint = search(sampleMaze.sample1, 'dfs')
    }else if(selectedAlgo.value === 'astar'){
      endPoint = astar(sampleMaze.sample1)
    }

    path = backTracking(endPoint);
    maze.fixTheCamera().then(function(){
      maze.drawTrace(visitedTrace).then(function(){
        maze.followThePath(path)
      })
    })
})
