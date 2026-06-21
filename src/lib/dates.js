// Lightweight date helpers. All "ISO" strings are local YYYY-MM-DD.

export function toISO(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(d, n) {
  const dt = d instanceof Date ? new Date(d) : fromISO(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

// Monday=0 ... Sunday=6
export function dowMon0(d) {
  const dt = d instanceof Date ? d : fromISO(d);
  return (dt.getDay() + 6) % 7;
}

export function mondayOf(d) {
  const dt = d instanceof Date ? new Date(d) : fromISO(d);
  const diff = dowMon0(dt);
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function weekDayISOs(mondayDate) {
  const out = [];
  for (let i = 0; i < 7; i++) out.push(toISO(addDays(mondayDate, i)));
  return out;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatLong(d) {
  const dt = d instanceof Date ? d : fromISO(d);
  return `${DAYS[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
}

export function formatShort(d) {
  const dt = d instanceof Date ? d : fromISO(d);
  return `${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`;
}

export function formatMonthYear(d) {
  const dt = d instanceof Date ? d : fromISO(d);
  return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function diffDays(aISO, bISO) {
  const a = fromISO(aISO);
  const b = fromISO(bISO);
  return Math.round((a - b) / 86400000);
}

export const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
