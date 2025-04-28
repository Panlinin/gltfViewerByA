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

export { debounce };