const PEAK_START_HOUR = 14;
const PEAK_END_HOUR = 18;
const CHINA_OFFSET_HOURS = 8;
const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;

export interface PeakHoursStatus {
  inPeakHours: boolean;
  timeUntilTransition: string;
  transitionType: 'start' | 'end';
}

function getChinaTime(): Date {
  const now = new Date();
  const str = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
  return new Date(str);
}

export function getPeakHoursStatus(): PeakHoursStatus {
  const chinaTime = getChinaTime();
  const currentHour = chinaTime.getHours();

  let inPeakHours: boolean;
  let transitionTime: Date;
  let transitionType: 'start' | 'end';

  if (currentHour >= PEAK_START_HOUR && currentHour < PEAK_END_HOUR) {
    inPeakHours = true;
    transitionType = 'end';
    transitionTime = new Date(chinaTime);
    transitionTime.setHours(PEAK_END_HOUR, 0, 0, 0);
  } else {
    inPeakHours = false;
    transitionType = 'start';

    let transitionDay = new Date(chinaTime);
    if (currentHour >= PEAK_END_HOUR) {
      transitionDay.setDate(transitionDay.getDate() + 1);
    }

    transitionDay.setHours(PEAK_START_HOUR, 0, 0, 0);
    transitionTime = transitionDay;
  }

  const diffMs = transitionTime.getTime() - chinaTime.getTime();
  const hours = Math.floor(diffMs / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  let timeUntilTransition: string;
  if (hours > 0 && minutes > 0) {
    timeUntilTransition = `${hours} hours ${minutes} minutes`;
  } else if (hours > 0) {
    timeUntilTransition = `${hours} hours`;
  } else {
    timeUntilTransition = `${minutes} minutes`;
  }

  return {
    inPeakHours,
    timeUntilTransition,
    transitionType
  };
}

function formatGMTOffset(): string {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMinutesRemainder = Math.abs(offsetMinutes % 60);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  return `GMT${sign}${offsetHours}${offsetMinutesRemainder > 0 ? ':' + String(offsetMinutesRemainder).padStart(2, '0') : ''}`;
}

function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getPeakHoursRange(): string {
  const now = new Date();

  const startUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0));
  const endUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0));

  const startTime = formatLocalTime(startUTC);
  const endTime = formatLocalTime(endUTC);

  return `${startTime} - ${endTime}`;
}

export function formatPeakHoursMessage(status: PeakHoursStatus): string {
  const icon = status.inPeakHours ? '🔴' : '✅';
  const peakHoursText = status.inPeakHours ? 'peak' : 'off-peak';
  const offset = formatGMTOffset();
  const currentTime = formatLocalTime(new Date());
  const peakHours = getPeakHoursRange();

  return `${icon} Currently in z.ai ${peakHoursText} hours.\n${status.timeUntilTransition} remaining.\n\nCurrent time: ${currentTime} (${offset})\nPeak hours:   ${peakHours} (${offset})`;
}
