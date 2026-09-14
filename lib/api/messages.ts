import { request } from './client';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    return [
      {
        id: 'c1',
        participantName: 'Rahul Sharma',
        participantAvatar: '',
        lastMessage: 'Where should I pick up the burger?',
        lastMessageTime: '10:42 AM',
        unreadCount: 1,
      },
      {
        id: 'c2',
        participantName: 'Aman Verma',
        participantAvatar: '',
        lastMessage: "I'm outside your PG gate with the pizza!",
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
      },
    ];
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    return [
      {
        id: 'm1',
        senderId: 'other',
        senderName: 'Rahul Sharma',
        receiverId: 'me',
        content: 'Hey Vanshaj! I saw your order for Sector 18.',
        timestamp: '10:38 AM',
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: 'You',
        receiverId: 'other',
        content: 'Hi Rahul! Yes, please get extra spicy Biryani if possible.',
        timestamp: '10:40 AM',
      },
      {
        id: 'm3',
        senderId: 'other',
        senderName: 'Rahul Sharma',
        receiverId: 'me',
        content: 'Where should I pick up the burger?',
        timestamp: '10:42 AM',
      },
    ];
  },

  sendMessage: async (conversationId: string, text: string): Promise<ChatMessage> => {
    return {
      id: Math.random().toString(36).substring(2, 9),
      senderId: 'me',
      senderName: 'You',
      receiverId: 'other',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
