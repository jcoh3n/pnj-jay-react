export interface ChatParticipant {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export interface ChatNotification {
  id: string;
  chatId: string;
  message: ChatMessage;
  read: boolean;
  createdAt: string;
}
