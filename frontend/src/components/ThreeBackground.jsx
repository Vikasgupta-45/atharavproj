import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    /* ── Scene setup ─────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 35);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* ── Mouse tracking ──────────────────────── */
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    /* ── Ambient / directional lights ──────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0x0D9488, 1.2);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);
    const pLight = new THREE.PointLight(0x5EEAD4, 2, 60);
    pLight.position.set(-10, 8, 12);
    scene.add(pLight);

    /* ── Shared material ─────────────────────── */
    const wireMat = (color, opacity = 0.18) =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity,
        wireframe: false,
        roughness: 0.3,
        metalness: 0.4,
      });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x5EEAD4, transparent: true, opacity: 0.35 });

    const addEdges = (geo, mesh) => {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone());
      mesh.add(edges);
    };

    /* ── 3D Floating objects ─────────────────── */
    const group = new THREE.Group();
    scene.add(group);

    const objects = [];
    const configs = [
      { geo: new THREE.IcosahedronGeometry(3.2, 0), pos: [-14, 6, -4], color: 0x0D9488, opacity: 0.18, speed: 0.006 },
      { geo: new THREE.OctahedronGeometry(2.4, 0), pos: [13, -5, -6], color: 0x2DD4BF, opacity: 0.20, speed: 0.008 },
      { geo: new THREE.TorusGeometry(2.8, 0.6, 12, 40), pos: [0, 9, -10], color: 0x0F766E, opacity: 0.15, speed: 0.004 },
      { geo: new THREE.TetrahedronGeometry(2.6, 0), pos: [8, 7, -2], color: 0x5EEAD4, opacity: 0.22, speed: 0.010 },
      { geo: new THREE.IcosahedronGeometry(1.8, 0), pos: [-8, -8, -3], color: 0x99F6E4, opacity: 0.25, speed: 0.007 },
      { geo: new THREE.OctahedronGeometry(1.4, 0), pos: [15, 4, -8], color: 0x0D9488, opacity: 0.18, speed: 0.009 },
      { geo: new THREE.BoxGeometry(2.2, 2.2, 2.2), pos: [-16, -4, -6], color: 0x2DD4BF, opacity: 0.16, speed: 0.005 },
      { geo: new THREE.TorusGeometry(1.6, 0.4, 10, 30), pos: [-4, -10, -5], color: 0x0F766E, opacity: 0.18, speed: 0.011 },
    ];

    configs.forEach(({ geo, pos, color, opacity, speed }) => {
      const mat = wireMat(color, opacity);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.userData.speed = speed;
      mesh.userData.phase = Math.random() * Math.PI * 2;
      mesh.userData.floatY = pos[1];
      addEdges(geo, mesh);
      group.add(mesh);
      objects.push(mesh);
    });

    /* ── Particles (stars) ───────────────────── */
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 120;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.14, color: 0x0D9488, transparent: true, opacity: 0.22, depthWrite: false });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ── Resize ──────────────────────────────── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    /* ── Animation loop ──────────────────────── */
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      target.x += (mouse.x - target.x) * 0.04;
      target.y += (mouse.y - target.y) * 0.04;

      group.rotation.y = target.x * 0.35;
      group.rotation.x = target.y * 0.20;

      objects.forEach((obj) => {
        const { speed, phase, floatY } = obj.userData;
        obj.rotation.x += speed;
        obj.rotation.y += speed * 0.7;
        obj.position.y = floatY + Math.sin(t * 0.5 + phase) * 0.8;
      });

      particles.rotation.y = t * 0.04 + target.x * 0.08;
      particles.rotation.x = t * 0.02 + target.y * 0.05;

      camera.position.x += (target.x * 2 - camera.position.x) * 0.025;
      camera.position.y += (-target.y * 1.5 - camera.position.y) * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      objects.forEach((o) => { o.geometry.dispose(); o.material.dispose(); });
      pGeo.dispose(); pMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0" />
      {/* Soft radial glow blobs */}
      <div className="absolute -left-24 top-16  h-80 w-80 rounded-full bg-[#5EEAD4]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[#2DD4BF]/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#CCFBF1]/40 blur-3xl" />
    </div>
  );
}

export default ThreeBackground;
