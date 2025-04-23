import React, { useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Layout } from 'antd';
import ModelViewer from './components/ModelViewer';
import PositionInfo from './components/PositionInfo';
import ModelLoader from './components/ModelLoader';
import FileUploader from './components/FileUploader';
import './App.css';

const { Header, Content, Footer } = Layout;

interface SceneData {
  position: THREE.Vector3;
  size: THREE.Vector3;
  [key: string]: any;
}

const App: React.FC = () => {
  // 状态管理
  const [file, setFile] = useState<File | null>(null);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [modelPosition, setModelPosition] = useState<THREE.Vector3 | undefined>(undefined);
  const [sceneInfo, setSceneInfo] = useState<SceneData | undefined>(undefined);

  // 事件处理函数
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setModelPosition(undefined);
    setSceneInfo(undefined);
  }, []);

  const handleCameraPositionChange = useCallback((position: THREE.Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleModelLoad = useCallback((position: THREE.Vector3, size: THREE.Vector3) => {
    setModelPosition(position);
  }, []);

  const handleSceneLoad = useCallback((sceneData: SceneData) => {
    setSceneInfo(sceneData);
  }, []);

  // 渲染模型组件
  const modelComponent = useMemo(() => {
    if (!file) return null;

    return (
      <ModelLoader
        fileUrl={URL.createObjectURL(file)}
        onModelLoad={handleModelLoad}
        onSceneLoad={handleSceneLoad}
      />
    );
  }, [file, handleModelLoad, handleSceneLoad]);

  return (
    <Layout className="app-container">
      <Header className="app-header">
        <h1>GLTF 模型查看器</h1>
      </Header>
      
      <Content className="app-content">
        <div className="file-upload-section">
          <FileUploader onFileSelect={handleFileSelect} />
          
          {file && (
            <div className="file-info">
              <p>文件名: {file.name}</p>
              <p>大小: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          <div className="model-info-section">
            <PositionInfo 
              modelPosition={modelPosition} 
              cameraPosition={cameraPosition} 
              scene={sceneInfo} 
            />
          </div>
        </div>

        <div className="model-viewer-section">
          <div className="model-container">
            <ModelViewer onCameraPositionChange={handleCameraPositionChange}>
              {modelComponent}
            </ModelViewer>
          </div>
        </div>
      </Content>

      <Footer className="app-footer">
        <p>© 2024 GLTF Viewer - 使用 Three.js 构建</p>
      </Footer>
    </Layout>
  );
};

export default App;