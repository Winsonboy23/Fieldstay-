// DEPRECATED: activities now live in Supabase `activities` table.
// Use getActivity / getActivities from `app/_lib/data-service` instead.
// Kept only to avoid breaking any stale imports during transition.

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function normalizeActivity(a) {
  if (!a) return null;
  const d = new Date(a.activity_date + "T00:00:00");
  const start = (a.start_time || "").slice(0, 5);
  const end = (a.end_time || "").slice(0, 5);
  return {
    ...a,
    shortTitle: a.short_title || a.title,
    day: String(d.getDate()),
    month: MONTHS[d.getMonth()],
    weekday: WEEKDAYS[d.getDay()],
    dateLabel: `${d.getDate()} ${MONTHS[d.getMonth()]} (${WEEKDAYS[d.getDay()]})`,
    time: `${start} - ${end}`,
  };
}
