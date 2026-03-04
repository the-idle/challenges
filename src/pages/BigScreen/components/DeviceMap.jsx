import { useEffect, useRef, useState } from 'react';
import { GlobalOutlined } from '@ant-design/icons';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const DeviceMap = () => {
  const containerRef = useRef(null);
  const mixerRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const baseScaleRef = useRef(1);
  const baseSizeRef = useRef(new THREE.Vector3());
  const frameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const modelInfoRef = useRef({
    size: new THREE.Vector3(),
    scale: 1
  });
  const [scaleMultiplier, setScaleMultiplier] = useState(3);
  const [cameraDistance, setCameraDistance] = useState(1.62);
  const scaleMultiplierRef = useRef(scaleMultiplier);
  const cameraDistanceRef = useRef(cameraDistance);

  useEffect(() => {
    scaleMultiplierRef.current = scaleMultiplier;
  }, [scaleMultiplier]);

  useEffect(() => {
    cameraDistanceRef.current = cameraDistance;
  }, [cameraDistance]);

  const applyScale = () => {
    if (!modelRef.current) {
      return;
    }
    const scale = baseScaleRef.current * scaleMultiplierRef.current;
    modelRef.current.scale.setScalar(scale);
    modelInfoRef.current = {
      size: baseSizeRef.current.clone().multiplyScalar(scale),
      scale
    };
  };

  const applyCameraDistance = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) {
      return;
    }
    const target = controls.target;
    const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
    camera.position.copy(target).addScaledVector(direction, cameraDistanceRef.current);
    camera.updateProjectionMatrix();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(-1.71, 1.01, -8.81);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.borderRadius = '4px';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.1;
    controls.maxDistance = 30;
    controls.target.set(-0.29, 0.23, -8.81);
    controls.update();
    controls.enabled = false;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(2, 3, 4);
    scene.add(ambientLight, directionalLight);

    let model = null;
    let hasAnimations = false;
    const loader = new GLTFLoader();
    loader.load('/model/all.glb', (gltf) => {
      model = gltf.scene;
      modelRef.current = model;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = maxDim > 0 ? 2.4 / maxDim : 1;
      baseScaleRef.current = baseScale;
      baseSizeRef.current = size.clone();
      applyScale();

      if (gltf.animations && gltf.animations.length > 0) {
        hasAnimations = true;
        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.reset();
          action.play();
        });
        mixer.timeScale = 1;
        mixerRef.current = mixer;
      }
    });

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) {
        return;
      }
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      } else if (!hasAnimations && model) {
        model.rotation.y += delta * 0.3;
      }
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    applyScale();
  }, [scaleMultiplier]);

  useEffect(() => {
    applyCameraDistance();
  }, [cameraDistance]);

  return (
    <div className="time-series-container" style={{ height: '100%', position: 'relative' }}>
      <div className="chart-header">
        <div className="chart-title">
          <GlobalOutlined style={{ marginRight: '8px', fontSize: '18px', color: 'var(--primary-color)' }} />
          柔性智能分拣系统模型
        </div>
      </div>
      <div className="device-map" style={{ height: 'calc(100% - 30px)', position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default DeviceMap;
