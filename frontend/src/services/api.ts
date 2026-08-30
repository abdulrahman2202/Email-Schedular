import axios from "axios";
import type {
  EmailListResponse,
  EmailDetailResponse,
  ScheduleEmailRequest,
  ScheduleEmailResponse,
  SearchResponse,
} from "@/types/email";
import type { SenderListResponse, CreateSenderRequest, CreateSenderResponse } from "@/types/sender";
import type { SlackStatus, User } from "@/types/user";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Auth
export function getGoogleLoginUrl(): string {
  return `${API_BASE}/api/auth/google`;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

export async function getHealth() {
  const { data } = await api.get<{ status: string; database: string }>("/api/health");
  return data;
}

// Emails
export async function getScheduledEmails(): Promise<EmailListResponse> {
  const { data } = await api.get<EmailListResponse>("/api/emails/scheduled");
  return data;
}

export async function getSentEmails(): Promise<EmailListResponse> {
  const { data } = await api.get<EmailListResponse>("/api/emails/sent");
  return data;
}

export async function scheduleEmails(req: ScheduleEmailRequest): Promise<ScheduleEmailResponse> {
  const { data } = await api.post<ScheduleEmailResponse>("/api/emails/schedule", req);
  return data;
}

export async function searchEmails(query: string): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>("/api/emails/search", { params: { q: query } });
  return data;
}

export async function getEmailById(id: string): Promise<EmailDetailResponse> {
  const { data } = await api.get<EmailDetailResponse>(`/api/emails/${id}`);
  return data;
}

// Senders
export async function getSenders(): Promise<SenderListResponse> {
  const { data } = await api.get<SenderListResponse>("/api/senders");
  return data;
}

export async function createSender(req: CreateSenderRequest): Promise<CreateSenderResponse> {
  const { data } = await api.post<CreateSenderResponse>("/api/senders", req);
  return data;
}

// Slack
export async function getSlackStatus(): Promise<SlackStatus> {
  const { data } = await api.get<SlackStatus>("/api/slack/status");
  return data;
}

export async function disconnectSlack() {
  const { data } = await api.post<{ success: boolean; message: string }>("/api/slack/disconnect");
  return data;
}

export function getSlackConnectUrl(): string {
  return `${API_BASE}/api/slack/connect`;
}

export { api };
