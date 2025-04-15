import React, { useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ModelViewer from './components/ModelViewer';
import PositionInfo from './components/PositionInfo';
import ModelLoader from './components/ModelLoader';
import './App.css';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [modelPosition, setModelPosition] = useState<THREE.Vector3 | undefined>(undefined);
  const [sceneInfo, setSceneInfo] = useState<any>(undefined);
  const [showPositionInfo] = useState(true);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setModelPosition(undefined);
    setSceneInfo(undefined);
  }, []);

  const handleCameraPositionChange = useCallback((position: THREE.Vector3) => {
    setCameraPosition(position);
  }, []);

  const modelComponent = useMemo(() => {
    if (!file) return <></>;

    return (
      <ModelLoader
        fileUrl={URL.createObjectURL(file)}
        onModelLoad={(scenePosition: THREE.Vector3, size: THREE.Vector3) => {
          setModelPosition(scenePosition);
        }}
        onSceneLoad={(sceneData) => {
          setSceneInfo(sceneData);
        }}
      />
    );
  }, [file]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GLTF 模型查看器</h1>
      </header>
      
      <main className="app-main">
        <div className="file-upload-section">
          <div className="file-upload-header">
            <h2>上传模型</h2>
            <Upload
              accept=".gltf,.glb"
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileSelect(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </div>
          {file && (
            <div className="file-info">
              <p>文件名: {file.name}</p>
              <p>大小: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
          {showPositionInfo && (
            <div className="model-info-section">
              <PositionInfo 
                modelPosition={modelPosition} 
                cameraPosition={cameraPosition} 
                scene={sceneInfo} 
              />
            </div>
          )}
        </div>

        <div className="model-viewer-section">
          <div className="model-container">
            <ModelViewer
              onCameraPositionChange={handleCameraPositionChange}
            >
              {modelComponent}
            </ModelViewer>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 GLTF Viewer - 使用 Three.js 构建</p>
      </footer>
    </div>
  );
};

export default App;