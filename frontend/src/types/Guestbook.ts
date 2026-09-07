export interface GuestbookMessage {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}

export interface CreateGuestbookMessageInput {
  name: string;
  email: string;
  message: string;
}
