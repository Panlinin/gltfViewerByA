/**
 * 渲染优化器工具
 * 提供控制Three.js渲染循环性能的工具函数
 */

import * as THREE from 'three';

// 定义性能设置的类型
export interface PerformanceSettings {
  frameloop: 'always' | 'demand' | 'never';
  dpr: number | [min: number, max: number];
  performance: { min: number; max?: number };
}

/**
 * 创建自适应渲染循环控制器
 * 根据设备性能和操作状态动态调整渲染质量
 */
export class RenderOptimizer {
  private static instance: RenderOptimizer;
  private isInteracting: boolean = false;
  private lastInteractionTime: number = 0;
  private interactionTimeout: number = 1000; // 1秒钟无操作后降低渲染质量
  private rafId: number | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  
  // 渲染质量设置
  private highQualitySettings = {
    pixelRatio: window.devicePixelRatio,
    frameRate: 60,
  };
  
  private lowQualitySettings = {
    pixelRatio: Math.min(1.5, window.devicePixelRatio),
    frameRate: 30,
  };
  
  // 私有构造函数，使用单例模式
  private constructor() {
    this.setupListeners();
  }
  
  // 获取单例实例
  public static getInstance(): RenderOptimizer {
    if (!RenderOptimizer.instance) {
      RenderOptimizer.instance = new RenderOptimizer();
    }
    return RenderOptimizer.instance;
  }
  
  // 设置渲染器
  public setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
    this.applyHighQuality();
  }
  
  // 标记开始交互
  public startInteraction(): void {
    this.isInteracting = true;
    this.lastInteractionTime = Date.now();
    this.applyHighQuality();
  }
  
  // 标记结束交互
  public endInteraction(): void {
    this.lastInteractionTime = Date.now();
  }
  
  // 应用高质量渲染设置
  private applyHighQuality(): void {
    if (!this.renderer) return;
    
    this.renderer.setPixelRatio(this.highQualitySettings.pixelRatio);
    
    // 取消当前帧循环并设置高帧率
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  // 应用低质量渲染设置
  private applyLowQuality(): void {
    if (!this.renderer) return;
    
    this.renderer.setPixelRatio(this.lowQualitySettings.pixelRatio);
  }
  
  // 检查是否应该降低渲染质量
  private checkShouldReduceQuality(): void {
    if (!this.isInteracting && Date.now() - this.lastInteractionTime > this.interactionTimeout) {
      this.isInteracting = false;
      this.applyLowQuality();
    } else {
      // 仍在交互，保持高质量
      this.applyHighQuality();
      
      // 继续检查
      setTimeout(() => this.checkShouldReduceQuality(), this.interactionTimeout);
    }
  }
  
  // 设置事件监听器
  private setupListeners(): void {
    // 监听交互事件
    const interactionEvents = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'wheel', 'keydown'];
    
    interactionEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        this.startInteraction();
      }, { passive: true });
    });
    
    // 监听滚动结束
    window.addEventListener('scroll', () => {
      this.endInteraction();
    }, { passive: true });
    
    // 初始检查
    this.checkShouldReduceQuality();
  }
  
  // 获取设备性能等级
  public getDevicePerformanceLevel(): 'high' | 'medium' | 'low' {
    // 简单判断设备性能
    const pixelRatio = window.devicePixelRatio || 1;
    const isLowEndDevice = 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
      (window.innerWidth * window.innerHeight * pixelRatio > 2000000);
      
    if (pixelRatio >= 2 && !isLowEndDevice) {
      return 'high';
    } else if (pixelRatio >= 1.5 || !isLowEndDevice) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  // 根据设备性能调整渲染设置
  public optimizeForDevice(): void {
    const performanceLevel = this.getDevicePerformanceLevel();
    
    switch (performanceLevel) {
      case 'high':
        this.highQualitySettings.pixelRatio = window.devicePixelRatio;
        this.lowQualitySettings.pixelRatio = window.devicePixelRatio * 0.75;
        break;
      case 'medium':
        this.highQualitySettings.pixelRatio = Math.min(2, window.devicePixelRatio);
        this.lowQualitySettings.pixelRatio = Math.min(1.5, window.devicePixelRatio);
        break;
      case 'low':
        this.highQualitySettings.pixelRatio = Math.min(1.5, window.devicePixelRatio);
        this.lowQualitySettings.pixelRatio = 1;
        break;
    }
    
    this.applyHighQuality();
  }
}

// 自定义React Three Fiber性能配置钩子
export const getOptimizedPerformanceSettings = (): PerformanceSettings => {
  const optimizer = RenderOptimizer.getInstance();
  const performanceLevel = optimizer.getDevicePerformanceLevel();
  
  switch (performanceLevel) {
    case 'high':
      return { 
        frameloop: 'always',
        dpr: [1, 2] as [number, number],
        performance: { min: 0.8 }
      };
    case 'medium':
      return { 
        frameloop: 'demand',
        dpr: [1, 1.5] as [number, number],
        performance: { min: 0.6 }
      };
    case 'low':
      return { 
        frameloop: 'demand',
        dpr: 1,
        performance: { min: 0.4 }
      };
  }
}; 