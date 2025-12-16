import { Controller, Get } from '@nestjs/common';

@Controller()
export class AuthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'auth', timestamp: new Date().toISOString() };
  }
}
