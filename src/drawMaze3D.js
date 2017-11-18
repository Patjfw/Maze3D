export default function(canvas, mazeData){
  const ZOOM_MIN = 3;
  const ZOOM_MAX = 30;
  const WHEEL_DELTA = 288;

  //object, reference: https://jsfiddle.net/MadLittleMods/n6u6asza/
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const panelGeo = new THREE.BoxGeometry(1, 1, 0.2);

  let raq;
  let canvasDom, renderer, scene, camera;
  let woodTexture, boxMaterial, panelMaterial, startPanelMaterial, endPanelMaterial, ballMaterial;
  let group, ball;
  let isDragging = false;
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

    ballMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7500
    });

    group = new THREE.Group();
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

          group.add(cube);
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

        group.add(panel)
      }
    }

    scene.add(group);
  }

  function bindEvent(){
    renderer.domElement.addEventListener('mousedown', function(e) {
      isDragging = true;
    })
    renderer.domElement.addEventListener('mousemove', function(e) {
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
    });
    /* */

    renderer.domElement.addEventListener('mousewheel', function(e) {
      if(camera.position.z >= ZOOM_MIN && camera.position.z <= ZOOM_MAX){

        camera.position.z += e.deltaY / WHEEL_DELTA;
        camera.position.z < ZOOM_MIN ? camera.position.z = ZOOM_MIN : 1;
        camera.position.z > ZOOM_MAX ? camera.position.z = ZOOM_MAX : 1;
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
    followThePath (path) {
      console.log(path)
    },
    rebuildScene (maze) {

    }
  }
}
