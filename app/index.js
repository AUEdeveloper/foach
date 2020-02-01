let engine, scene, camera;

// Populates some object into an XR scene and sets the initial camera position.
const initXrScene = ({ scene, camera }) => {
  const directionalLight = new BABYLON.DirectionalLight(
    "DirectionalLight",
    new BABYLON.Vector3(0, -1, 1),
    scene
  );
  directionalLight.intensity = 1.0;

  // Import mesh of 3d lowpoly model
  BABYLON.SceneLoader.ImportMesh("", "./", "lowpoly.glb", scene, function(
    meshes
  ) {
    meshes[0].scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
    meshes[0].position = new BABYLON.Vector3(0, 0, 0);
  });

  // Set the initial camera position relative to the scene we just laid out. This must be at a
  // height greater than y=0.
  camera.position = new BABYLON.Vector3(0, 3, -5);
};

const recenterTouchHandler = e => {
  // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
  // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
  if (e.touches.length == 2) {
    XR8.XrController.recenter();
  }
};

const startScene = () => {
  console.log("startScene");
  const canvas = document.getElementById("renderCanvas");

  engine = new BABYLON.Engine(canvas, true, {
    stencil: true,
    preserveDrawingBuffer: true
  });
  engine.enableOfflineSupport = false;

  scene = new BABYLON.Scene(engine);
  camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 0, 0),
    scene
  );

  initXrScene({ scene, camera }); // Add objects to the scene and set starting camera position.

  // Connect the camera to the XR engine and show camera feed
  camera.addBehavior(XR8.Babylonjs.xrCameraBehavior());

  canvas.addEventListener("touchstart", recenterTouchHandler, true); // Add touch listener.

  engine.runRenderLoop(() => {
    // Render scene
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
};

const onxrloaded = () => {
  XR8.addCameraPipelineModules([
    // Add camera pipeline modules.
    XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
    XRExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
    XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
    XRExtras.RuntimeError.pipelineModule() // Shows an error image on runtime error.
  ]);

  startScene();
};

// Show loading screen before the full XR library has been loaded.
const load = () => {
  XRExtras.Loading.showLoading({ onxrloaded });
};
window.onload = () => {
  window.XRExtras ? load() : window.addEventListener("xrextrasloaded", load);
};
