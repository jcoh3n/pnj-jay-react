import { format, isToday, isYesterday } from 'date-fns';

export const formatTime = (date: string | Date | null | undefined) => {
  if (!date) return '';
  
  try {
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return '';
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    }
    
    if (isYesterday(messageDate)) {
      return 'Yesterday';
    }
    
    return format(messageDate, 'dd/MM/yyyy');
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

export const formatMessageTime = (date: string | Date | null | undefined) => {
  if (!date) return '';
  
  try {
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return '';
    return format(messageDate, 'HH:mm');
  } catch (error) {
    console.warn('Error formatting message time:', error);
    return '';
  }
};

export const validateTimestamp = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
};