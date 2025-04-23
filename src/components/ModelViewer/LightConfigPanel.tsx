import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import './styles.css';

// 灯光配置接口
export interface LightConfig {
  ambientIntensity: number;
  ambientColor: string;
  directIntensity: number;
  directColor: string;
  rimIntensity: number;
  rimColor: string;
  rimPosition: [number, number, number];
}

// 灯光配置面板组件
const LightConfigPanel: React.FC<{
  config: LightConfig;
  onConfigChange: (config: LightConfig) => void;
}> = ({ config, onConfigChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  // 使用防抖处理配置更新
  const debouncedConfigChange = useCallback(
    debounce((newConfig: LightConfig) => {
      onConfigChange(newConfig);
    }, 500),
    [onConfigChange]
  );

  const handleConfigChange = (newConfig: Partial<LightConfig>) => {
    const updatedConfig = { ...localConfig, ...newConfig };
    setLocalConfig(updatedConfig);
    debouncedConfigChange(updatedConfig);
  };

  return (
    <div className={`light-config-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>灯光配置</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      {isExpanded && (
        <div className="panel-content">
          <div className="config-group">
            <label>环境光强度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localConfig.ambientIntensity}
              onChange={(e) => handleConfigChange({
                ambientIntensity: parseFloat(e.target.value)
              })}
            />
            <span>{localConfig.ambientIntensity}</span>
          </div>
          <div className="config-group">
            <label>环境光颜色</label>
            <input
              type="color"
              value={localConfig.ambientColor}
              onChange={(e) => handleConfigChange({
                ambientColor: e.target.value
              })}
            />
          </div>
          <div className="config-group">
            <label>主光源强度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localConfig.directIntensity}
              onChange={(e) => handleConfigChange({
                directIntensity: parseFloat(e.target.value)
              })}
            />
            <span>{localConfig.directIntensity}</span>
          </div>
          <div className="config-group">
            <label>主光源颜色</label>
            <input
              type="color"
              value={localConfig.directColor}
              onChange={(e) => handleConfigChange({
                directColor: e.target.value
              })}
            />
          </div>
          <div className="config-group">
            <label>边缘光强度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localConfig.rimIntensity}
              onChange={(e) => handleConfigChange({
                rimIntensity: parseFloat(e.target.value)
              })}
            />
            <span>{localConfig.rimIntensity}</span>
          </div>
          <div className="config-group">
            <label>边缘光颜色</label>
            <input
              type="color"
              value={localConfig.rimColor}
              onChange={(e) => handleConfigChange({
                rimColor: e.target.value
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LightConfigPanel; 