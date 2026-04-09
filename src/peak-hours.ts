import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface PeakHoursStatus {
  inPeakHours: boolean;
  timeUntilTransition: string;
  transitionType: 'start' | 'end';
}

export function getPeakHoursStatus(): PeakHoursStatus {
  const peakHoursStart = 14;
  const peakHoursEnd = 18;

  const currentTime = dayjs().utc().utcOffset(8);
  const currentHour = currentTime.hour();

  let inPeakHours: boolean;
  let transitionTime: dayjs.Dayjs;
  let transitionType: 'start' | 'end';

  if (currentHour >= peakHoursStart && currentHour < peakHoursEnd) {
    inPeakHours = true;
    transitionType = 'end';
    transitionTime = currentTime.hour(peakHoursEnd).minute(0).second(0);
  } else {
    inPeakHours = false;
    transitionType = 'start';
    
    const transitionDay = currentHour >= peakHoursEnd 
      ? currentTime.add(1, 'day') 
      : currentTime;
    
    transitionTime = transitionDay.hour(peakHoursStart).minute(0).second(0);
  }

  const diff = transitionTime.diff(currentTime);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

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

export function formatPeakHoursMessage(status: PeakHoursStatus): string {
  if (status.inPeakHours) {
    return `Currently in peak hours. ${status.timeUntilTransition} remaining`;
  } else {
    return `Currently in off-peak hours. ${status.timeUntilTransition} remaining`;
  }
}