export const getHoursSince = (date: Date): number => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff / (1000 * 60 * 60);
};

export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

export const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

export const getNextOccurrence = (time: { hours: number; minutes: number }): Date => {
  const now = new Date();
  const next = new Date();
  next.setHours(time.hours, time.minutes, 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
};
