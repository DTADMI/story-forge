import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('/healthz')
  healthz() {
    return { status: 'ok', service: 'api', time: new Date().toISOString() };
  }

  @Get('/ready')
  ready() {
    // In a real app, check DB connections, queues, etc.
    return { status: 'ready', service: 'api', time: new Date().toISOString() };
  }
}
