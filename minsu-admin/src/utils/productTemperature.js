// 三溫層設定。冷藏沒有超商取貨（超商只有常溫與冷凍），只能走宅配。
export const TEMPERATURES = [
  {
    value: "normal",
    label: "常溫",
    color: "#3276A8",
    delivery: "超商取貨（7-11 / 全家）",
  },
  {
    value: "chilled",
    label: "冷藏",
    color: "#3A8D83",
    delivery: "黑貓低溫宅配",
  },
  {
    value: "frozen",
    label: "冷凍",
    color: "#B44B4B",
    delivery: "超商取貨（僅全家）",
  },
];

export function getTemperature(value) {
  return TEMPERATURES.find((t) => t.value === value) || TEMPERATURES[0];
}
