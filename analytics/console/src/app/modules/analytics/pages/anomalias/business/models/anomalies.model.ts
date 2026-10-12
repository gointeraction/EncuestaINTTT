export interface DeviceRow {
  id: string;
  channel: string;
  count: number;
}

export interface DuplicateAnswers {
  groups: number;
  max: number;
}

export interface HourlyPoint {
  hour: string;
  count: number;
}

export interface DailyPoint {
  day: string;
  count: number;
}

/** Payload del panel de anomalías (anti-fraude). */
export interface AnomaliesPayload {
  byDevice: DeviceRow[];
  duplicateAnswers: DuplicateAnswers;
  daily: DailyPoint[];
  hourly: HourlyPoint[];
  day: string;
}
