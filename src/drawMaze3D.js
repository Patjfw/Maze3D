export default function(canvas, mazeData){
  const ZOOM_MIN = 3;
  const ZOOM_MAX = 30;
  const WHEEL_DELTA = 288;
  const TRACE_INTERVAL = 50;
  const MOTION_INTERVAL = 80;

  //object, reference: https://jsfiddle.net/MadLittleMods/n6u6asza/
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const panelGeo = new THREE.BoxGeometry(1, 1, 0.2);

  let raq;
  let canvasDom, renderer, scene, camera;
  let woodTexture, boxMaterial, panelMaterial, startPanelMaterial, endPanelMaterial, tracePanelMaterial, ballMaterial, lineMaterial;
  let group, wallGroup, panelGroup, ball;
  let isDragging = false, controllable = true;
  let previousMousePosition = {
      x: 0,
      y: 0
  };

  function init() {
    canvasDom = document.getElementById(canvas);
    renderer = new THREE.WebGLRenderer({
      canvas: canvasDom
    });
    renderer.setClearColor(0x000000);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 15);
    scene.add(camera);

    THREE.ImageUtils.crossOrigin = '';
    woodTexture = THREE.ImageUtils.loadTexture('http://i.imgur.com/CEGihbB.gif');
    woodTexture.anisotropy = renderer.getMaxAnisotropy();

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
    group.add(wallGroup);
    group.add(panelGroup);
  }

  function buildScene(){
    var ballGeo = new THREE.SphereGeometry(0.5,20,20);
    ball = new THREE.Mesh(ballGeo, ballMaterial);

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
        if(i === mazeData.startPoint.y && j === mazeData.startPoint.x){
          panel.material = startPanelMaterial;
          ball.position.x = xPos;
          ball.position.y = yPos;
          group.add(ball);
        }else if(i === mazeData.endPoint.y && j === mazeData.endPoint.x){
          panel.material = endPanelMaterial;
        }
        panel.position.x = xPos;
        panel.position.y = yPos;
        panel.position.z = -0.6;
        panel.name = i*mazeData.maze[0].length+j

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



  init();
  buildScene();
  bindEvent();
  render();

  function drawPathLine(path) {
    let pathData = path;

    var lineGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(pathData.length * 3);

    lineGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    var line = new THREE.Line(lineGeometry, lineMaterial)
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
    console.log(positions)
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
  requestAnimationFrame(function loop(){
    stats.update();
    requestAnimationFrame(loop)
  });

  return {
    fixTheCamera () {
      console.log(group)
      group.rotation.x = 0;
      group.rotation.y = 0;
      group.rotation.z = 0;

      camera.position.z = 25;
      controllable = false;
    },
    drawTrace (trace) {
      console.log(`You visited ${trace.length} nodes`)
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
        }
      }, TRACE_INTERVAL);
    },
    followThePath (path) {
      console.log(`The path is ${path.length} nodes long`)
      console.log(path)
      drawPathLine(path)
    },
    rebuildScene (maze) {

    }
  }
}
