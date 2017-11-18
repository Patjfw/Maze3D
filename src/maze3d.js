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

let validatePos = function (maze, pos) {
  if(maze[pos.x][pos.y] === 1){
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

let BFS = function(maze){
  // for visited
  var copiedMaze = JSON.parse(JSON.stringify(maze.maze));
  var queue = [];
  queue.push(new Point(maze.startPoint.x, maze.startPoint.y, null));

  while(queue.length !== 0){
    var point = queue.shift();
    copiedMaze[point.x][point.y] = 0
    if(point.x === maze.endPoint.x && point.y === maze.endPoint.y){
      console.log("BFS, exit is reached")
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

var endPoint = BFS(sampleMaze.sample1)
var path = backTracking(endPoint);

let maze = maze3D("mazeCanvas", sampleMaze.sample1);
maze.followThePath(path)
