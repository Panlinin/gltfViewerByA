import React, { memo } from 'react';
import { OrbitControls } from '@react-three/drei';

// 优化后的OrbitControls组件，增强实时响应性
const OptimizedOrbitControls: React.FC = memo(() => {
  return <OrbitControls 
    makeDefault
    enableDamping 
    dampingFactor={0.2}
    // 提高响应性，降低阻尼
    enableZoom={true}
    zoomSpeed={0.7}
    rotateSpeed={0.7}
    panSpeed={0.7}
  />;
});

export default OptimizedOrbitControls; 