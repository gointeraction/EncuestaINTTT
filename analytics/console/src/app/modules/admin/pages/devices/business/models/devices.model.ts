export interface AdminDevice {
  id: string;
  name: string;
  channel: string;
  dailyQuota: number;
  active: boolean;
  total: number;
  today: number;
}

export interface NewDeviceSecret {
  id: string;
  secret: string;
}
