import React, { useState, useMemo, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import ModelViewer from './components/ModelViewer';
import ModelLoader from './components/ModelLoader';
import './App.css';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  // 使用 useMemo 缓存 fileUrl
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // 使用 useCallback 缓存 setFile 函数
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
  }, []);

  return (
    <div className="app-container">
      {/* <header className="app-header">
        <h1>GLTF模型查看器</h1>
      </header> */}
      
      <main className="app-main">
        <section className="file-upload-section">
          <FileUploader onFileSelect={handleFileSelect} />
          {file && (
            <div className="file-info">
              <p>文件名: {file.name}</p>
              <p>文件大小: {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </section>
        
        <section className="model-viewer-section">
          <ModelViewer>
            {file && fileUrl ? <ModelLoader fileUrl={fileUrl} /> : <React.Fragment />}
          </ModelViewer>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>GLTF查看器 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;