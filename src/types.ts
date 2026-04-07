export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  ownerId: string;
  date: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface Participant {
  id: string;
  sessionId: string;
  ownerId: string;
  nickname: string;
  practiceShots: number[];
  liveShots: number[];
  practicePhotoUrl?: string;
  livePhotoUrl?: string;
  createdAt: string;
}
