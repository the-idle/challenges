import { useCallback, useEffect, useRef, useState } from 'react';
import { GlobalOutlined } from '@ant-design/icons';
import { Button, Space, Spin } from 'antd';
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
  const animationActionsRef = useRef([]);
  const modelInfoRef = useRef({
    size: new THREE.Vector3(),
    scale: 1
  });
  const scaleMultiplierRef = useRef(3);
  const cameraDistanceRef = useRef(1.62);
  const animationEnabledRef = useRef(true);
  const hasAnimationsRef = useRef(false);
  const alarmEnabledRef = useRef(false);
  const alarmTargetRef = useRef(null);
  const alarmMaterialsRef = useRef([]);
  const alarmMaterialBackupRef = useRef([]);
  const alarmLightRef = useRef(null);
  const alarmPhaseRef = useRef(0);
  const tempVectorRef = useRef(new THREE.Vector3());
  const isVisibleRef = useRef(!document.hidden);
  const showModelRef = useRef(false);
  const [showModel, setShowModel] = useState(false);
  const [modelRequested, setModelRequested] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isModelLoadFailed, setIsModelLoadFailed] = useState(false);

  const clearAlarmEffect = useCallback(() => {
    alarmMaterialsRef.current.forEach((material, index) => {
      const backup = alarmMaterialBackupRef.current[index];
      if (!material || !backup) {
        return;
      }
      if (material.emissive && backup.emissive) {
        material.emissive.copy(backup.emissive);
        material.emissiveIntensity = backup.emissiveIntensity;
      }
      if (material.color && backup.color) {
        material.color.copy(backup.color);
      }
    });
    if (alarmLightRef.current) {
      alarmLightRef.current.visible = false;
      alarmLightRef.current.intensity = 0;
    }
  }, []);

  const handlePlayAnimation = useCallback(() => {
    animationEnabledRef.current = true;
    animationActionsRef.current.forEach((action) => {
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.enabled = true;
      action.paused = false;
      action.play();
    });
    if (mixerRef.current) {
      mixerRef.current.timeScale = 1;
    }
    setIsAnimating(true);
  }, []);

  const handlePlayAnimationOnce = useCallback(() => {
    animationEnabledRef.current = true;
    animationActionsRef.current.forEach((action) => {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.reset();
      action.enabled = true;
      action.paused = false;
      action.play();
    });
    if (mixerRef.current) {
      mixerRef.current.timeScale = 1;
    }
    setIsAnimating(true);
  }, []);

  const handlePauseAnimation = useCallback(() => {
    animationEnabledRef.current = false;
    if (mixerRef.current) {
      mixerRef.current.timeScale = 0;
    }
    setIsAnimating(false);
  }, []);

  const handleEnableAlarm = useCallback(() => {
    alarmEnabledRef.current = true;
    setIsAlarmActive(true);
  }, []);

  const handleDisableAlarm = useCallback(() => {
    alarmEnabledRef.current = false;
    clearAlarmEffect();
    setIsAlarmActive(false);
  }, [clearAlarmEffect]);

  const handleShowModel = useCallback(() => {
    setModelRequested(true);
    showModelRef.current = true;
    setShowModel(true);
  }, []);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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

    const alarmLight = new THREE.PointLight(0xff2f2f, 0, 2.8, 2);
    alarmLight.visible = false;
    scene.add(alarmLight);
    alarmLightRef.current = alarmLight;

    let model = null;
    const loader = new GLTFLoader();
    setIsModelLoading(true);
    setIsModelLoadFailed(false);
    loader.load(
      '/model/all.glb',
      (gltf) => {
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

        const nameMatcher = /(motor|fan|pump|arm|joint|gear|bearing|engine|电机|关节|机械臂|传动)/i;
        let selectedMesh = null;
        model.traverse((node) => {
          if (!selectedMesh && node.isMesh && nameMatcher.test(node.name || '')) {
            selectedMesh = node;
          }
        });
        if (!selectedMesh) {
          model.traverse((node) => {
            if (!selectedMesh && node.isMesh) {
              selectedMesh = node;
            }
          });
        }
        if (selectedMesh) {
          const originalMaterials = Array.isArray(selectedMesh.material) ? selectedMesh.material : [selectedMesh.material];
          const clonedMaterials = originalMaterials.map((material) => (material?.clone ? material.clone() : material));
          selectedMesh.material = Array.isArray(selectedMesh.material) ? clonedMaterials : clonedMaterials[0];
          alarmTargetRef.current = selectedMesh;
          alarmMaterialsRef.current = clonedMaterials.filter(Boolean);
          alarmMaterialBackupRef.current = alarmMaterialsRef.current.map((material) => ({
            emissive: material.emissive?.clone?.() || null,
            emissiveIntensity: typeof material.emissiveIntensity === 'number' ? material.emissiveIntensity : 0,
            color: material.color?.clone?.() || null
          }));
        }

        if (gltf.animations && gltf.animations.length > 0) {
          hasAnimationsRef.current = true;
          const mixer = new THREE.AnimationMixer(model);
          const actions = [];
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.reset();
            action.play();
            actions.push(action);
          });
          animationActionsRef.current = actions;
          mixer.timeScale = 1;
          mixerRef.current = mixer;
        }
        setIsModelLoading(false);
      },
      undefined,
      () => {
        setIsModelLoading(false);
        setIsModelLoadFailed(true);
      }
    );

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
      if (!isVisibleRef.current || !showModelRef.current) {
        frameRef.current = null;
        return;
      }
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (animationEnabledRef.current && mixerRef.current) {
        mixerRef.current.update(delta);
      } else if (animationEnabledRef.current && !hasAnimationsRef.current && model) {
        model.rotation.y += delta * 0.3;
      }
      if (alarmEnabledRef.current && alarmTargetRef.current) {
        alarmPhaseRef.current += delta * 7;
        const pulse = (Math.sin(alarmPhaseRef.current) + 1) / 2;
        alarmMaterialsRef.current.forEach((material) => {
          if (material.emissive) {
            material.emissive.setRGB(1, 0, 0);
            material.emissiveIntensity = 0.8 + pulse * 1.4;
          } else if (material.color) {
            material.color.setRGB(0.65 + pulse * 0.35, 0, 0);
          }
        });
        if (alarmLightRef.current) {
          alarmTargetRef.current.getWorldPosition(tempVectorRef.current);
          alarmLightRef.current.position.copy(tempVectorRef.current);
          alarmLightRef.current.visible = true;
          alarmLightRef.current.intensity = 1.4 + pulse * 2;
        }
      } else {
        clearAlarmEffect();
      }
      if (controlsRef.current?.enabled) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };

    const startAnimation = () => {
      if (frameRef.current) {
        return;
      }
      clockRef.current.getDelta();
      animate();
    };

    const stopAnimation = () => {
      if (!frameRef.current) {
        return;
      }
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current && showModelRef.current) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    if (showModelRef.current) {
      startAnimation();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === '0') {
        handlePlayAnimationOnce();
      } else if (key === '1') {
        handlePlayAnimation();
      } else if (key === '2') {
        handlePauseAnimation();
      } else if (key === '3') {
        handleEnableAlarm();
      } else if (key === '4') {
        handleDisableAlarm();
      } else if (key === '5') {
        handleShowModel();
        startAnimation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAnimation();
      clearAlarmEffect();
      alarmLightRef.current = null;
      alarmTargetRef.current = null;
      alarmMaterialsRef.current = [];
      alarmMaterialBackupRef.current = [];
      animationActionsRef.current = [];
      if (resizeObserver) {
        resizeObserver.disconnect();
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
  }, [clearAlarmEffect, handleDisableAlarm, handleEnableAlarm, handlePauseAnimation, handlePlayAnimation, handlePlayAnimationOnce, handleShowModel]);

  useEffect(() => {
    applyScale();
  }, []);

  useEffect(() => {
    applyCameraDistance();
  }, []);

  return (
    <div className="time-series-container" style={{ height: '100%', position: 'relative' }}>
      <div className="chart-header">
        <div className="chart-title">
          <GlobalOutlined style={{ marginRight: '8px', fontSize: '18px', color: 'var(--primary-color)' }} />
          柔性智能分拣系统模型
        </div>
        <Space size={6} wrap>
          <Button size="small" onClick={handlePlayAnimationOnce}>播放一次</Button>
          <Button size="small" type={isAnimating ? 'primary' : 'default'} onClick={handlePlayAnimation}>播放动画</Button>
          <Button size="small" onClick={handlePauseAnimation}>暂停动画</Button>
          <Button size="small" danger type={isAlarmActive ? 'primary' : 'default'} onClick={handleEnableAlarm}>开启警报</Button>
          <Button size="small" onClick={handleDisableAlarm}>关闭警报</Button>
          <Button size="small" type={showModel ? 'primary' : 'default'} onClick={handleShowModel}>显示模型</Button>
        </Space>
      </div>
      <div className="device-map" style={{ height: 'calc(100% - 30px)', position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', opacity: showModel ? 1 : 0 }} />
        {!modelRequested ? (
          <div className="device-map-loading device-map-awaiting">
            <div className="device-map-awaiting-pulse" />
            <div className="device-map-awaiting-text">模型待命中，按 5 显示模型</div>
            <div className="device-map-awaiting-subtext">快捷键：0播一次 1循环 2暂停 3红光开 4红光关 6 AI预警</div>
          </div>
        ) : null}
        {modelRequested && isModelLoading ? (
          <div className="device-map-loading">
            <Spin size="large" />
            <div className="device-map-awaiting-text">3D模型加载中...</div>
          </div>
        ) : null}
        {!isModelLoading && isModelLoadFailed ? (
          <div className="device-map-load-failed">模型加载失败，请检查模型文件或网络</div>
        ) : null}
      </div>
    </div>
  );
};

export default DeviceMap;
