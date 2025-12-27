import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Security headers
    app.use(
        helmet({
            // We'll craft a stricter CSP later once external domains are finalized
            contentSecurityPolicy: false,
        })
    );
    if (process.env.NODE_ENV === 'production') {
        app.use(
            helmet.hsts({
                maxAge: 60 * 60 * 24 * 60, // 60 days
                includeSubDomains: true,
                preload: true,
            })
        );
    }
    const origins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    app.enableCors({
        origin: origins.length ? origins : true,
        credentials: true,
    });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

bootstrap();
