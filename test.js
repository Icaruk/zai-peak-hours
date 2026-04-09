import { getPeakHoursStatus, formatPeakHoursMessage } from './dist/peak-hours.js';

console.log('Testing Peak Hours Plugin Logic...\n');

const status = getPeakHoursStatus();
const message = formatPeakHoursMessage(status);

console.log('Current Status:');
console.log(`- In Peak Hours: ${status.inPeakHours}`);
console.log(`- Time Until Transition: ${status.timeUntilTransition}`);
console.log(`- Transition Type: ${status.transitionType}`);
console.log(`\nMessage: ${message}`);