/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param waitTime 等待时间，默认1000ms
 * @param immediate 是否立即执行，默认false
 * @returns 返回防抖后的函数
 */
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  waitTime: number = 1000,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout | null = null;
  let isImmediateCalled = false;

  return function (...args: Parameters<T>) {
    if (immediate && !isImmediateCalled) {
      fn(...args);
      isImmediateCalled = true;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      if (!immediate) {
        fn(...args);
      }
      timer = null;
      isImmediateCalled = false;
    }, waitTime);
  };
};

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param waitTime 等待时间，默认1000ms
 * @returns 返回节流后的函数
 */
const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  waitTime: number = 1000
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  let timer: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    
    // 如果距离上次执行时间小于等待时间，则设置定时器
    if (now - lastTime < waitTime) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn(...args);
        lastTime = Date.now();
        timer = null;
      }, waitTime - (now - lastTime));// 剩余等待时间后执行
    } else {
      // 如果距离上次执行时间大于等于等待时间，则立即执行
      fn(...args);
      lastTime = now;
    }
  };
};

export { debounce, throttle };