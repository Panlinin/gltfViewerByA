import { debounce } from '../index';

describe('debounce function', () => {
  jest.useFakeTimers();

  it('should execute the function only once after the wait time', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    // 快速调用多次
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // 此时函数不应该被执行
    expect(mockFn).not.toHaveBeenCalled();

    // 快进时间
    jest.advanceTimersByTime(1000);

    // 此时函数应该只被执行一次
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments correctly', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn('test', 123);
    jest.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledWith('test', 123);
  });

  it('should use default wait time if not provided', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn);

    debouncedFn();
    jest.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should clear previous timer when called again', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    jest.advanceTimersByTime(500);
    debouncedFn();
    jest.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should execute immediately when immediate is true', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000, true);

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn();
    jest.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should maintain proper type safety', () => {
    const typedFn = (a: string, b: number) => a + b;
    const debouncedFn = debounce(typedFn);

    // This should not cause type errors
    debouncedFn('test', 123);
    
    // This should cause type errors (commented out as it would fail compilation)
    // debouncedFn(123, 'test'); // Type error
  });
}); 