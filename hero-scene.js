import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("[data-three-hero]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

  const group = new THREE.Group();
  scene.add(group);

  const ambient = new THREE.AmbientLight(0xffffff, 0.72);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2.5, 3.2, 4.2);
  scene.add(ambient, key);

  const materials = {
    milk: new THREE.MeshStandardMaterial({
      color: 0xfffbec,
      roughness: 0.32,
      metalness: 0,
      transparent: true,
      opacity: 0.72,
    }),
    cream: new THREE.MeshStandardMaterial({
      color: 0xfff2cc,
      roughness: 0.46,
      transparent: true,
      opacity: 0.62,
    }),
    mango: new THREE.MeshStandardMaterial({
      color: 0xf2a51d,
      roughness: 0.38,
      transparent: true,
      opacity: 0.72,
    }),
    green: new THREE.MeshStandardMaterial({
      color: 0x14a35c,
      roughness: 0.44,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    }),
    red: new THREE.MeshStandardMaterial({
      color: 0xb3232d,
      roughness: 0.4,
      transparent: true,
      opacity: 0.6,
    }),
  };

  const makeCurve = (points, color, radius, opacity) => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    const geometry = new THREE.TubeGeometry(curve, 92, radius, 18, false);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    return mesh;
  };

  const milkRibbon = makeCurve(
    [
      [-2.3, -1.1, -0.3],
      [-1.35, 0.15, 0.35],
      [0.1, 0.46, -0.15],
      [1.45, 0.05, 0.28],
      [2.25, 0.92, -0.18],
    ],
    0xfffbec,
    0.035,
    0.5,
  );

  const mangoRibbon = makeCurve(
    [
      [-1.9, 1.05, -0.25],
      [-0.85, 0.72, 0.14],
      [0.22, 1.22, -0.18],
      [1.12, 0.75, 0.2],
      [2.0, 1.08, -0.25],
    ],
    0xf5ad25,
    0.023,
    0.42,
  );

  const redRibbon = makeCurve(
    [
      [-2.0, -0.05, 0.05],
      [-0.9, -0.52, -0.18],
      [0.28, -0.34, 0.22],
      [1.18, -0.86, -0.15],
      [2.1, -0.42, 0.12],
    ],
    0xc92a35,
    0.018,
    0.34,
  );

  const droplets = [];
  const dropletGeometry = new THREE.SphereGeometry(1, 24, 24);
  const colors = [materials.milk, materials.cream, materials.mango, materials.green, materials.red];

  for (let index = 0; index < 64; index += 1) {
    const material = colors[index % colors.length];
    const mesh = new THREE.Mesh(dropletGeometry, material);
    const angle = index * 0.63;
    const radius = 0.58 + (index % 9) * 0.18;
    const scale = 0.035 + (index % 5) * 0.012;
    mesh.scale.setScalar(scale);
    mesh.position.set(
      Math.cos(angle) * radius + (index % 3) * 0.34,
      Math.sin(angle * 0.78) * 0.9 + ((index % 7) - 3) * 0.18,
      Math.sin(angle) * 0.45,
    );
    mesh.userData = {
      baseY: mesh.position.y,
      speed: 0.55 + (index % 6) * 0.08,
      phase: index * 0.37,
      lift: 0.08 + (index % 4) * 0.025,
    };
    droplets.push(mesh);
    group.add(mesh);
  }

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0.42);
  leafShape.bezierCurveTo(0.36, 0.18, 0.34, -0.2, 0, -0.43);
  leafShape.bezierCurveTo(-0.36, -0.2, -0.34, 0.18, 0, 0.42);
  const leafGeometry = new THREE.ShapeGeometry(leafShape);

  for (let index = 0; index < 12; index += 1) {
    const leaf = new THREE.Mesh(leafGeometry, materials.green);
    leaf.position.set(-1.85 + index * 0.33, -0.8 + Math.sin(index) * 0.55, -0.12 + (index % 3) * 0.08);
    leaf.rotation.set(0.35, 0.1, index * 0.52);
    leaf.scale.setScalar(0.16 + (index % 4) * 0.025);
    leaf.userData = {
      baseRotation: leaf.rotation.z,
      speed: 0.35 + index * 0.025,
      phase: index * 0.65,
    };
    group.add(leaf);
  }

  const pointer = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 720 ? 6.2 : 4.9;
    group.position.x = width < 720 ? 0.58 : 1.45;
    group.position.y = width < 720 ? -0.34 : 0.05;
    group.scale.setScalar(width < 720 ? 0.82 : 1);
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });

  let measuredPixels = false;
  const measureCanvasPixels = () => {
    const gl = renderer.getContext();
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const sampleWidth = Math.min(width, 320);
    const sampleHeight = Math.min(height, 180);
    const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
    gl.readPixels(
      Math.floor((width - sampleWidth) / 2),
      Math.floor((height - sampleHeight) / 2),
      sampleWidth,
      sampleHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );

    let litPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] > 8 || pixels[index + 1] > 8 || pixels[index + 2] > 8 || pixels[index + 3] > 8) {
        litPixels += 1;
      }
    }

    canvas.dataset.pixelSample = String(litPixels);
    canvas.dataset.pixelRatio = String((litPixels / (sampleWidth * sampleHeight)).toFixed(4));
    measuredPixels = true;
  };

  const render = (time = 0) => {
    const seconds = time * 0.001;
    group.rotation.y = Math.sin(seconds * 0.22) * 0.18 + pointer.x * 0.08;
    group.rotation.x = Math.sin(seconds * 0.18) * 0.07 - pointer.y * 0.04;
    milkRibbon.rotation.z = Math.sin(seconds * 0.38) * 0.035;
    mangoRibbon.rotation.z = Math.cos(seconds * 0.32) * 0.04;
    redRibbon.rotation.z = Math.sin(seconds * 0.28) * 0.04;

    droplets.forEach((mesh) => {
      mesh.position.y = mesh.userData.baseY + Math.sin(seconds * mesh.userData.speed + mesh.userData.phase) * mesh.userData.lift;
      mesh.rotation.x += 0.004;
      mesh.rotation.y += 0.006;
    });

    group.children.forEach((child) => {
      if (child.geometry === leafGeometry) {
        child.rotation.z = child.userData.baseRotation + Math.sin(seconds * child.userData.speed + child.userData.phase) * 0.16;
      }
    });

    renderer.render(scene, camera);
    canvas.dataset.sceneReady = "true";
    canvas.dataset.engine = "three.js r164";

    if (!measuredPixels) {
      measureCanvasPixels();
    }

    if (!reducedMotion) {
      requestAnimationFrame(render);
    }
  };

  render();
}
