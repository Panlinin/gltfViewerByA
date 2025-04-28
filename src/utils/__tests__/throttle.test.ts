import { throttle } from '../index';

describe('throttle function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should execute immediately on first call', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should throttle multiple calls within wait time', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1000);

    // 第一次调用立即执行
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 快速连续调用多次
    throttledFn();
    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 快进时间到等待时间后
    jest.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should execute with correct arguments', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn('test', 123);
    expect(mockFn).toHaveBeenCalledWith('test', 123);
  });

  it('should maintain proper timing between executions', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1000);

    // 第一次调用
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 等待500ms后再次调用
    jest.advanceTimersByTime(500);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 再等待500ms，总共1000ms后应该执行第二次
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple calls with different arguments', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn('first');
    jest.advanceTimersByTime(500);
    throttledFn('second');
    jest.advanceTimersByTime(500);
    throttledFn('third');

    // 最后一次调用的参数应该被保留
    jest.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenLastCalledWith('third');
  });

  it('should work with scroll events', () => {
    const mockScrollHandler = jest.fn();
    const throttledScroll = throttle(mockScrollHandler, 200);

    // 模拟快速滚动
    throttledScroll();
    throttledScroll();
    throttledScroll();
    expect(mockScrollHandler).toHaveBeenCalledTimes(1);

    // 等待一段时间后再次滚动
    jest.advanceTimersByTime(200);
    throttledScroll();
    expect(mockScrollHandler).toHaveBeenCalledTimes(2);
  });

  it('should work with resize events', () => {
    const mockResizeHandler = jest.fn();
    const throttledResize = throttle(mockResizeHandler, 500);

    // 模拟快速调整窗口大小
    throttledResize();
    throttledResize();
    throttledResize();
    expect(mockResizeHandler).toHaveBeenCalledTimes(1);

    // 等待一段时间后再次调整
    jest.advanceTimersByTime(500);
    throttledResize();
    expect(mockResizeHandler).toHaveBeenCalledTimes(2);
  });

  it('should work with zero wait time', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 0);

    throttledFn();
    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should handle negative wait time', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, -1000);

    throttledFn();
    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should handle rapid consecutive calls', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // 模拟100次快速调用
    for (let i = 0; i < 100; i++) {
      throttledFn();
    }
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 等待一段时间后应该再执行一次
    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
}); 