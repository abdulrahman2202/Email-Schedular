export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface SlackStatus {
  success: boolean;
  connected: boolean;
  teamId: string | null;
}
