export default function(canvas, maze){
  const ZOOM_MIN = 3;
  const ZOOM_MAX = 30;
  const WHEEL_DELTA = 288;
  const TRACE_INTERVAL = 50;
  const MOTION_INTERVAL = 80;

  //object, reference: https://jsfiddle.net/MadLittleMods/n6u6asza/
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const panelGeo = new THREE.BoxGeometry(1, 1, 0.2);

  let mazeData = maze;
  let raq;
  let canvasDom, renderer, scene, camera;
  let woodTexture, boxMaterial, panelMaterial, startPanelMaterial, endPanelMaterial, tracePanelMaterial, ballMaterial, lineMaterial;
  let group, wallGroup, panelGroup, ball;
  let isDragging = false, controllable = true;
  let previousMousePosition = {
      x: 0,
      y: 0
  };



  function init(maze) {
    mazeData = maze;
    canvasDom = document.getElementById(canvas);
    renderer = new THREE.WebGLRenderer({
      canvas: canvasDom
    });
    renderer.setClearColor(0x000000);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 25);
    scene.add(camera);

    THREE.ImageUtils.crossOrigin = '';
    let textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous'
    woodTexture = textureLoader.load('http://i.imgur.com/CEGihbB.gif');
    woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    boxMaterial = new THREE.MeshBasicMaterial({
      map: woodTexture
    })

    panelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2
    });

    startPanelMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });

    endPanelMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8
    });

    tracePanelMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9a97,
      transparent: true,
      opacity: 0.5
    });

    ballMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7500
    });

    lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 0.4
    });

    group = new THREE.Group();
    wallGroup = new THREE.Group();
    panelGroup = new THREE.Group();
    panelGroup.name = "panel";
    group.add(wallGroup);
    group.add(panelGroup);
  }

  function buildScene(){
    var ballGeo = new THREE.SphereGeometry(0.5,20,20);
    ball = new THREE.Mesh(ballGeo, ballMaterial);
    ball.name = "ball";

    // the scene's coordinate is different from canvas
    for(let i = mazeData.maze.length-1; i >= 0; i--){
      for(let j = 0; j <mazeData.maze[i].length; j++){
        let xPos = (j - mazeData.maze[0].length/2 + 1/2)*1 ;
        let yPos = ((mazeData.maze.length-1-i) - mazeData.maze.length/2 + 1/2)*1;
        if(mazeData.maze[i][j] === 0){
          let cube = new THREE.Mesh(boxGeo, boxMaterial);
          cube.position.x = xPos
          cube.position.y = yPos;

          wallGroup.add(cube);
        }
        let panel = new THREE.Mesh(panelGeo, panelMaterial);
        panel.position.x = xPos;
        panel.position.y = yPos;
        panel.position.z = -0.6;
        panel.name = i*mazeData.maze[0].length+j

        if(i === mazeData.startPoint.y && j === mazeData.startPoint.x){
          panel.name = "startPoint";
          panel.material = startPanelMaterial;
          ball.position.x = xPos;
          ball.position.y = yPos;
          group.add(ball);
        }else if(i === mazeData.endPoint.y && j === mazeData.endPoint.x){
          panel.name = "endPoint";
          panel.material = endPanelMaterial;
        }

        panelGroup.add(panel)
      }
    }

    scene.add(group);
  }

  function bindEvent(){
    renderer.domElement.addEventListener('mousedown', function(e) {
      if(controllable){
        isDragging = true;
      }
    })
    renderer.domElement.addEventListener('mousemove', function(e) {
      if(controllable){
        if(isDragging) {
          var deltaMove = {
            x: e.offsetX-previousMousePosition.x,
            y: e.offsetY-previousMousePosition.y
          };

          var deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                  toRadians(deltaMove.y * 1),
                  toRadians(deltaMove.x * 1),
                  0,
                  'XYZ'
                ));

          group.quaternion.multiplyQuaternions(deltaRotationQuaternion, group.quaternion);
        }

        previousMousePosition = {
          x: e.offsetX,
          y: e.offsetY
        };
      }
    });
    /* */

    renderer.domElement.addEventListener('mousewheel', function(e) {
      if(controllable){
        if(camera.position.z >= ZOOM_MIN && camera.position.z <= ZOOM_MAX){

          camera.position.z += e.deltaY / WHEEL_DELTA;
          camera.position.z < ZOOM_MIN ? camera.position.z = ZOOM_MIN : 1;
          camera.position.z > ZOOM_MAX ? camera.position.z = ZOOM_MAX : 1;
        }
      }
    });

    document.body.addEventListener('mouseup', function(e) {
        isDragging = false;
    });
  }

  function render() {
    renderer.render(scene, camera);

    raq = window.requestAnimationFrame(render);
  }


  init(maze);
  buildScene();
  bindEvent();
  render();


  function drawPathLine(path) {
    let pathData = path;

    var lineGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(pathData.length * 3);

    lineGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    var line = new THREE.Line(lineGeometry, lineMaterial)
    line.name="line"
    var drawCount = 0; // draw the first 2 points, only
    lineGeometry.setDrawRange( 0, drawCount )
    var index = 0;
    for(var data of pathData){
      positions[index++] = data.x - mazeData.maze[0].length/2 + 1/2;
      positions[index++] = mazeData.maze.length-1-data.y - mazeData.maze.length/2 + 1/2;
      positions[index++] = 0.5;
    }

	  lineGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    group.add(line)

    let motionInterval = setInterval(() => {
      ball.position.x = positions[drawCount*3];
      ball.position.y = positions[drawCount*3+1];
      drawCount++;

	    lineGeometry.setDrawRange( 0, drawCount )
      if(drawCount === path.length){
        clearInterval(motionInterval);
      }
    }, MOTION_INTERVAL)
  }

  //tools
  function toRadians(angle) {
  	return angle * (Math.PI / 180);
  }

  // function toDegrees(angle) {
  // 	return angle * (180 / Math.PI);
  // }

  //stats
  var stats=new Stats();
  document.body.appendChild(stats.dom);
  var statsMonitor = requestAnimationFrame(function loop(){
    stats.update();
    requestAnimationFrame(loop)
  });

  return {
    fixTheCamera () {
      return new Promise(function(resolve, reject){
        controllable = false;
        var dx = group.rotation.x - 0;
        var dy = group.rotation.y - 0;
        var dz = group.rotation.z - 0;
        var dcamera = camera.position.z - 25;

        let rotateToOrigin = requestAnimationFrame(function loop(){
          group.rotation.x -= dx/60;
          group.rotation.y -= dy/60;
          group.rotation.z -= dz/60;

          camera.position.z -= dcamera/90;
          //console.log(group.rotation.x, group.rotation.y, group.rotation.z, camera.position.z)
          if(Math.abs(group.rotation.x) < 0.1){
            group.rotation.x = 0;
          }

          if(Math.abs(group.rotation.y) < 0.1){
            group.rotation.y = 0;
          }

          if(Math.abs(group.rotation.z) < 0.1){
            group.rotation.z = 0;
          }

          if(Math.abs(camera.position.z - 25) < 0.5){
            camera.position.z = 25
          }


          if(Math.abs(group.rotation.x) < 0.1 &&
             Math.abs(group.rotation.y) < 0.1 &&
             Math.abs(group.rotation.z) < 0.1 &&
             Math.abs(camera.position.z - 25) < 0.5
          ){
            group.rotation.x = 0;
            group.rotation.y = 0;
            group.rotation.z = 0;
            camera.position.z = 25;
            window.cancelAnimationFrame(rotateToOrigin)
            resolve("camera reset done")
          }else{
            requestAnimationFrame(loop)
          }
        })
      })
    },
    drawTrace (trace) {
      return new Promise(function(resolve, reject){
        let cur = 1;
        let len = trace.length-1;
        let interval = setInterval(function(){
          let posName = trace[cur].x + trace[cur].y*mazeData.maze[0].length;
          let curPanel = panelGroup.children.find((item)=>{
            return item.name === posName
          })
          curPanel.material = tracePanelMaterial;
          cur++;
          if(cur === len){
            clearInterval(interval);
            resolve("trace done")
          }
        }, TRACE_INTERVAL);
      })
    },
    followThePath (path) {
      drawPathLine(path)
    },
    rebuildScene () {
      group.remove(scene.getObjectByName("line", true));
      for(let child of panelGroup.children){
        if(child.name === "startPoint"){
          ball.position.x = child.position.x;
          ball.position.y = child.position.y;
          continue;
        }

        if(child.name === "endPoint"){
          continue
        }

        child.material = panelMaterial
      }
    },
    cleanScene () {
      while(scene.children.length > 0){
          scene.remove(scene.children[0]);
      }
    }
  }
}
