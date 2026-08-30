export interface Email {
  id: string;
  userId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: "scheduled" | "processing" | "sent" | "failed";
  messageId: string | null;
  error: string | null;
  createdAt: string;
}

export interface ScheduleEmailRequest {
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
}

export interface ScheduleEmailResponse {
  success: boolean;
  message: string;
  count: number;
  emails: Email[];
}

export interface EmailListResponse {
  success: boolean;
  emails: Email[];
}

export interface SearchResponse {
  success: boolean;
  query: string;
  emails: Email[];
}
