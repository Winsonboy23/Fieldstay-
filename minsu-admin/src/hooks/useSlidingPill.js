import { useLayoutEffect, useRef, useState } from "react";

// 切換鈕底下的色塊：量出選中那顆按鈕（data-active="true"）的位置和寬度，讓色塊滑過去
export function useSlidingPill(activeKey) {
  const ref = useRef(null);
  const [pill, setPill] = useState(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    function measure() {
      const active = container.querySelector("[data-active='true']");
      if (!active) {
        setPill(null);
        return;
      }
      const { offsetLeft: left, offsetWidth: width } = active;
      setPill((prev) =>
        prev && prev.left === left && prev.width === width
          ? prev
          : { left, width }
      );
    }

    measure();
    // 字型晚一點載入時按鈕會變寬，要重量一次
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  return [ref, pill];
}
