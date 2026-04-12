export interface PeakHoursStatus {
  inPeakHours: boolean;
  timeUntilTransition: string;
  transitionType: 'start' | 'end';
}

export function getPeakHoursStatus(): PeakHoursStatus {
  const peakHoursStart = 14;
  const peakHoursEnd = 18;

  // Calcular hora actual en UTC+8 (China timezone)
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const chinaTime = new Date(utcMs + 8 * 3600000);
  const currentHour = chinaTime.getHours();

  let inPeakHours: boolean;
  let transitionTime: Date;
  let transitionType: 'start' | 'end';

  if (currentHour >= peakHoursStart && currentHour < peakHoursEnd) {
    inPeakHours = true;
    transitionType = 'end';
    transitionTime = new Date(chinaTime);
    transitionTime.setHours(peakHoursEnd, 0, 0, 0);
  } else {
    inPeakHours = false;
    transitionType = 'start';
    
    let transitionDay = new Date(chinaTime);
    if (currentHour >= peakHoursEnd) {
      transitionDay.setDate(transitionDay.getDate() + 1);
    }
    
    transitionDay.setHours(peakHoursStart, 0, 0, 0);
    transitionTime = transitionDay;
  }

  const diffMs = transitionTime.getTime() - chinaTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

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
