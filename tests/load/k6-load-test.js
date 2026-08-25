import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 concurrent virtual players
    { duration: '1m', target: 200 },  // Surge to 200 concurrent players
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete under 200ms
    http_req_failed: ['rate<0.01'],   // Error rate below 1%
  },
};

export default function () {
  // 1. Health check telemetry endpoint
  const resMetrics = http.get('http://localhost:4000/metrics');
  check(resMetrics, {
    'metrics HTTP 200': (r) => r.status === 200,
  });

  // 2. Query AI prediction engine endpoint
  const payload = JSON.stringify([
    { active_players: 50, active_rooms: 5, cpu_usage_pct: 45.0, memory_usage_mb: 300, average_latency_ms: 25 },
    { active_players: 120, active_rooms: 12, cpu_usage_pct: 75.0, memory_usage_mb: 450, average_latency_ms: 35 },
  ]);

  const params = { headers: { 'Content-Type': 'application/json' } };
  const resAI = http.post('http://localhost:8000/api/v1/predict', payload, params);

  check(resAI, {
    'AI predict HTTP 200': (r) => r.status === 200,
    'AI forecast returned': (r) => JSON.parse(r.body).predicted_players_5m > 0,
  });

  sleep(1);
}
