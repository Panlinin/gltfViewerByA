import React, { useState } from 'react';
import * as THREE from 'three';
import OptimizedCanvas from '../OptimizedCanvas';
import LightConfigPanel, { LightConfig } from './LightConfigPanel';
import SceneSetup from './SceneSetup';
import ModelViewerContent from './ModelViewerContent';
import './styles.css';

interface ModelLoaderProps {
  onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void;
}

interface ModelViewerProps {
  children: React.ReactElement<ModelLoaderProps>;
  onCameraPositionChange?: (position: THREE.Vector3) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  children, 
  onCameraPositionChange
}) => {
  const [lightConfig, setLightConfig] = useState<LightConfig>({
    ambientIntensity: 0.8,
    ambientColor: '#ffffff',
    directIntensity: 0.9,
    directColor: '#ffffff',
    rimIntensity: 0.5,
    rimColor: '#ffffff',
    rimPosition: [0, 0, -100]
  });

  return (
    <div className="model-viewer-container">
      <LightConfigPanel
        config={lightConfig}
        onConfigChange={setLightConfig}
      />
      <OptimizedCanvas>
        <SceneSetup lightConfig={lightConfig} />
        <ModelViewerContent
          isFragment={false}
          onModelLoad={() => {}}
          onCameraPositionChange={onCameraPositionChange}
        >
          {children}
        </ModelViewerContent>
      </OptimizedCanvas>
    </div>
  );
};

export default ModelViewer;
