import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LightConfig } from './LightConfigPanel';

// 创建一个Scene设置组件，用于设置场景
const SceneSetup: React.FC<{
  lightConfig?: LightConfig;
}> = ({ lightConfig = {
  ambientIntensity: 0.8,
  ambientColor: '#ffffff',
  directIntensity: 0.9,
  directColor: '#ffffff',
  rimIntensity: 0.5,
  rimColor: '#ffffff',
  rimPosition: [0, 0, -100]
} }) => {
  const { scene } = useThree();
  const lightsRef = useRef<{
    directionalLight1?: THREE.DirectionalLight;
    directionalLight2?: THREE.DirectionalLight;
    rimLight?: THREE.DirectionalLight;
    ambientLight?: THREE.AmbientLight;
  }>({});
  
  useEffect(() => {
    // 创建主光源
    lightsRef.current.directionalLight1 = new THREE.DirectionalLight(
      new THREE.Color(lightConfig.directColor),
      lightConfig.directIntensity
    );
    lightsRef.current.directionalLight1.position.set(0, 57, 33);
    lightsRef.current.directionalLight1.castShadow = true;
    lightsRef.current.directionalLight1.shadow.mapSize.width = 2048;
    lightsRef.current.directionalLight1.shadow.mapSize.height = 2048;
    
    // 创建辅助光源
    lightsRef.current.directionalLight2 = new THREE.DirectionalLight(
      new THREE.Color(lightConfig.directColor),
      lightConfig.directIntensity * 0.6
    );
    lightsRef.current.directionalLight2.position.set(-95, 28, -33);
    
    // 创建边缘光
    lightsRef.current.rimLight = new THREE.DirectionalLight(
      new THREE.Color(lightConfig.rimColor),
      lightConfig.rimIntensity
    );
    lightsRef.current.rimLight.position.set(...lightConfig.rimPosition);
    
    // 创建环境光
    lightsRef.current.ambientLight = new THREE.AmbientLight(
      new THREE.Color(lightConfig.ambientColor),
      lightConfig.ambientIntensity
    );

    // 添加灯光到场景
    scene.add(lightsRef.current.directionalLight1);
    scene.add(lightsRef.current.directionalLight2);
    scene.add(lightsRef.current.rimLight);
    scene.add(lightsRef.current.ambientLight);

    return () => {
      // 清理资源
      Object.values(lightsRef.current).forEach(light => {
        if (light) {
          scene.remove(light);
        }
      });
    };
  }, [scene, lightConfig]);

  return null;
};

export default SceneSetup; 