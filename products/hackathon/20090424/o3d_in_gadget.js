o3djs.basePath = "http://lab.webos-goodies.jp/goo_home/";
o3djs.require('o3djs.util');
o3djs.require('o3djs.rendergraph');
o3djs.require('o3djs.pack');
o3djs.require('o3djs.camera');
o3djs.require('o3djs.scene');
o3djs.require('o3djs.event');

// global variables
var g_finished = false;  // for selenium testing

var O3DApp = (function() {

  var KLASS, screenEl, o3d, client, viewInfo, pack, sceneRoot;

  KLASS = {
	onReady : function() {}
  };

  function initialize(screenElements) {
    screenEl  = screenElements[0];
    o3d       = screenEl.o3d;
    client    = screenEl.client;
    pack      = client.createPack();
    viewInfo  = o3djs.rendergraph.createBasicView(pack, client.root, client.renderGraphRoot);
    sceneRoot = pack.createObject('Transform');

	KLASS.element   = screenEl;
	KLASS.o3d       = o3d;
    KLASS.client    = client;
	KLASS.pack      = pack;
	KLASS.viewInfo  = viewInfo;
	KLASS.sceneRoot = sceneRoot;

	KLASS.onReady();
  }

  _IG_RegisterOnloadHandler(function() {
    o3djs.util.makeClients(initialize);
  });

  return KLASS;

})();

var g_clock = 0;
var g_timeMult = 1;
var g_clockParams = [];

var g_drag = false;
var g_dragSX = 0, g_dragSY = 0;
var g_rotX = 0, g_rotY = 0;

O3DApp.onReady = function() {
  O3DApp.sceneRoot.parent = O3DApp.client.root;
  loadScene(O3DApp.pack, 'assets/teapot.tgz', O3DApp.sceneRoot);
};

function loadScene(pack, fileName, parent) {
  o3djs.scene.loadScene(
	O3DApp.client,
	O3DApp.pack,
	parent,
	'http://lab.webos-goodies.jp/goo_home/assets/teapot.tgz',
	callback);

  function callback(pack, parent, exception) {
    if (exception) {
	  alert('Could not load: ' + fileName + '\n' + exception);
	  return;
    }

    var cameraInfo = o3djs.camera.getViewAndProjectionFromCameras(
	  parent,
	  O3DApp.client.width,
	  O3DApp.client.height);

    O3DApp.viewInfo.drawContext.view = cameraInfo.view;
    O3DApp.viewInfo.drawContext.projection = cameraInfo.projection;

    createCheckerBoard(pack, 'Material__26');

	o3djs.event.addEventListener(O3DApp.element, 'mousedown', onMouseDown);
	o3djs.event.addEventListener(O3DApp.element, 'mousemove', onMouseMove);
	o3djs.event.addEventListener(O3DApp.element, 'mouseup',   onMouseUp);

    o3djs.pack.preparePack(pack, O3DApp.viewInfo);
	O3DApp.client.setRenderCallback(renderCallback);

    g_finished = true;  // for selenium testing.
  };
}

function createCheckerBoard(pack, materialName) {
  var effectString = document.getElementById('checkerShader').value;
  var effect = O3DApp.pack.createObject('Effect');
  effect.loadFromFXString(effectString);
  var materials = pack.getObjects(materialName, 'o3d.Material');
  for (var m = 0; m < materials.length; m++) {
    var material = materials[m];
    material.effect = effect;
    effect.createUniformParameters(material);
	g_clockParams.push(material.getParam('clock'));
  }
}

function onMouseDown(event) {
  g_drag   = true;
  g_dragSX = event.x;
  g_dragSY = event.y;
}

function onMouseMove(event) {
  if(g_drag) {
	g_rotY += (event.x - g_dragSX) / 100.0;
	g_rotX += (event.y - g_dragSY) / 100.0;
	g_dragSX = event.x;
	g_dragSY = event.y;
  }
}

function onMouseUp(event) {
  g_drag = false;
}

function renderCallback(renderEvent) {
  g_clock += renderEvent.elapsedTime;
  O3DApp.sceneRoot.identity();
  O3DApp.sceneRoot.rotateX(g_rotX);
  O3DApp.sceneRoot.rotateY(g_rotY);
  for(var i = 0 ; i < g_clockParams.length ; ++i) {
	g_clockParams[i].value = g_clock;
  }
}
