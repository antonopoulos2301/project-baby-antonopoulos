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

export type GuestbookStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminGuestbookMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: GuestbookStatus;
  createdAt: string;
}
