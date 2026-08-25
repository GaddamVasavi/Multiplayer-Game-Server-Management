import { Controller, Get, Header } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Analytics & Monitoring')
@Controller('metrics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiOperation({ summary: 'Expose Prometheus Scrape Endpoint' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics string formatted text/plain' })
  async getMetrics() {
    return this.analyticsService.getMetricsText();
  }
}
