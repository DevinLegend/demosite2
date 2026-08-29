(function () {
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("stageCanvas");
  const label = document.getElementById("stageLabel");
  if (!stage || !canvas || !label || typeof THREE === "undefined") return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050505, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0.2, 0.45, 6.4);

  const steak = new THREE.Group();
  scene.add(steak);

  function grainTexture() {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = 128 + (Math.random() - 0.5) * 90;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.4, 2.4);
    return tex;
  }

  function meatGeometry() {
    const geo = new THREE.SphereGeometry(1, 96, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      x *= 1.38;
      y *= 1.18;
      z *= 0.52;
      const fiber = Math.sin(y * 11 + x * 2.2) * 0.035;
      const lump = Math.sin(x * 5.1 + y * 4.4) * 0.08 + Math.sin(x * 9.2) * 0.03;
      const r = Math.sqrt(x * x * 0.7 + y * y);
      if (r > 0.3) {
        x += (x / (r + 0.001)) * lump;
        y += (y / (r + 0.001)) * lump * 0.75;
      }
      z += fiber;
      z *= 1 + Math.sin(x * 3.2 + y * 2.6) * 0.22;
      if (x < -0.75) {
        z *= 0.7;
        y *= 0.82;
      }
      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  const bump = grainTexture();
  const meatMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.93,
    metalness: 0,
    envMapIntensity: 0.05,
    bumpMap: bump,
    bumpScale: 0.07,
    roughnessMap: bump
  });

  const meat = new THREE.Mesh(meatGeometry(), meatMat);
  meat.position.x = 0.82;
  steak.add(meat);

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xe4d3b4,
    roughness: 0.88,
    metalness: 0,
    bumpMap: bump,
    bumpScale: 0.03
  });
  const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 28), boneMat);
  bone.rotation.z = Math.PI / 2;
  bone.position.set(-0.88, 0.02, 0);
  steak.add(bone);

  const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 28, 18), boneMat);
  knuckle.scale.set(1.2, 0.88, 0.72);
  knuckle.position.set(-2.16, 0.02, 0);
  steak.add(knuckle);

  steak.rotation.z = -0.16;
  steak.rotation.y = 0.4;

  scene.add(new THREE.HemisphereLight(0xe8d4c0, 0x140e0c, 1.2));
  const key = new THREE.DirectionalLight(0xf4e6d4, 0.28);
  key.position.set(1.6, 4.2, 3.2);
  scene.add(key);

  new THREE.TextureLoader().load("images/38-tomahawk-ribeye-cut.jpg", (tex) => {
    const img = tex.image;
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const max = Math.max(px[i], px[i + 1], px[i + 2]);
      if (max > 175) {
        const t = 175 / max;
        px[i] *= t;
        px[i + 1] *= t;
        px[i + 2] *= t;
      }
    }
    ctx.putImageData(data, 0, 0);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1.1, 1.1);
    meatMat.map = map;
    meatMat.bumpMap = map;
    meatMat.bumpScale = 0.1;
    meatMat.roughness = 1;
    meatMat.envMapIntensity = 0;
    meatMat.needsUpdate = true;
  });

  let scroll = 0;
  const progress = () => {
    const rect = stage.getBoundingClientRect();
    const total = stage.offsetHeight - window.innerHeight;
    const traveled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    return total ? traveled / total : 0;
  };

  const fit = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("scroll", () => { scroll = progress(); }, { passive: true });
  scroll = progress();

  let t = 0;
  const tick = () => {
    t += 0.016;
    const p = scroll;
    const morph = Math.min(1, Math.max(0, (p - 0.42) / 0.38));
    const ease = morph * morph * (3 - 2 * morph);

    steak.rotation.x = reduced ? p * Math.PI : t * 0.45 + p * Math.PI * 2.2;

    meat.scale.set(1 + ease * 0.5, 1 - ease * 0.1, 1 - ease * 0.28);
    const boneGone = 1 - ease;
    bone.scale.set(1, boneGone, boneGone);
    knuckle.scale.set(1.2 * boneGone, 0.88 * boneGone, 0.72 * boneGone);
    bone.visible = knuckle.visible = ease < 0.95;
    steak.position.x = ease * 0.3;
    label.textContent = ease > 0.5 ? "Arrachera" : "Tomahawk";

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
})();
