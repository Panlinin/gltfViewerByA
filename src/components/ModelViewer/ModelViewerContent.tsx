import React, { memo } from 'react';
import { Stage, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { CameraPositionTracker } from '../PositionInfo';
import OptimizedOrbitControls from './OptimizedOrbitControls';
import HighlightController from './HighlightController';
import EmptyPlaceholder from './EmptyPlaceholder';

interface ModelLoaderProps {
  onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void;
}

// 渲染主体内容组件
const ModelViewerContent: React.FC<{
  children: React.ReactElement<ModelLoaderProps>;
  isFragment: boolean;
  onModelLoad: (center: THREE.Vector3, size: THREE.Vector3) => void;
  onCameraPositionChange?: (position: THREE.Vector3) => void;
  modelPosition?: THREE.Vector3;
}> = memo(({ children, isFragment, onModelLoad, onCameraPositionChange, modelPosition }) => {
  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      {onCameraPositionChange && (
        <CameraPositionTracker onPositionChange={onCameraPositionChange} />
      )}
      <Stage 
        adjustCamera 
        intensity={0.5} 
        shadows={false}
        preset="rembrandt"
      >
        {(isFragment || !children )? (
          <EmptyPlaceholder />
        ) : (
          React.cloneElement(children, { 
            ...children.props,
            onModelLoad: (center: THREE.Vector3, size: THREE.Vector3) => {
              onModelLoad(center, size);
              if (children.props.onModelLoad) {
                children.props.onModelLoad(center, size);
              }
            }
          })
        )}
      </Stage>
      <OptimizedOrbitControls />
      <HighlightController />
      <Stats 
        className="custom-stats"
        showPanel={0}
      />
    </>
  );
});

export default ModelViewerContent; 