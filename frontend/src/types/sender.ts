export interface Sender {
  id: string;
  email: string;
  smtpUser: string;
  createdAt: string;
}

export interface SenderListResponse {
  success: boolean;
  senders: Sender[];
}

export interface CreateSenderRequest {
  email: string;
  smtpUser: string;
  smtpPassword: string;
}

export interface CreateSenderResponse {
  success: boolean;
  sender: Sender;
}
