import { format, isToday, isYesterday } from 'date-fns';

export const formatTime = (date: string | Date) => {
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }
  
  if (isYesterday(messageDate)) {
    return 'Yesterday';
  }
  
  return format(messageDate, 'dd/MM/yyyy');
};
