export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime: string;
  participants: Record<string, boolean>;
  online?: boolean;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}
