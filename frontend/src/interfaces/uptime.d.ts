interface UptimeSetting {
  url: string;
  method: string;
  interval: number;
  enabled: boolean;
  name: string;
}

interface UptimeResponse {
  url: string;
  uptime: number;
  hour?: string;
}

interface ServiceLevelIndicator {
  averageLatency: number;
  errorRate: number;
  throughput: number;
  prevAverageLatency: number;
  prevErrorRate: number;
  prevThroughput: number;
}
