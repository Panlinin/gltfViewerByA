import { debounce, throttle } from '../index';

describe('utils functions', () => {
  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let count = 0;
      const increment = () => count++;
      const debouncedIncrement = debounce(increment, 100);

      // 快速调用多次
      debouncedIncrement();
      debouncedIncrement();
      debouncedIncrement();

      // 等待防抖时间过去
      setTimeout(() => {
        expect(count).toBe(1);
        done();
      }, 200);
    });

    it('should execute immediately when immediate is true', () => {
      let count = 0;
      const increment = () => count++;
      const debouncedIncrement = debounce(increment, 100, true);

      debouncedIncrement();
      expect(count).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', (done) => {
      let count = 0;
      const increment = () => count++;
      const throttledIncrement = throttle(increment, 100);

      // 快速调用多次
      throttledIncrement();
      throttledIncrement();
      throttledIncrement();

      // 等待节流时间过去
      setTimeout(() => {
        expect(count).toBe(1);
        done();
      }, 200);
    });

    it('should allow multiple calls after wait time', (done) => {
      let count = 0;
      const increment = () => count++;
      const throttledIncrement = throttle(increment, 100);

      // 第一次调用
      throttledIncrement();

      // 等待节流时间过去后再次调用
      setTimeout(() => {
        throttledIncrement();
        expect(count).toBe(2);
        done();
      }, 200);
    });
  });
}); 