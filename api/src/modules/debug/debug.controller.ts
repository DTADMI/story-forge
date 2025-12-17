import { Controller, Get, NotFoundException } from '@nestjs/common';
import { apiFlags } from '../../config/flags';

@Controller('debug')
export class DebugController {
  @Get('flags')
  getFlags() {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      // Hide in production
      throw new NotFoundException();
    }
    return { env, flags: apiFlags };
  }
}
