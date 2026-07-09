import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend dev server and production
  const allowedOrigins = ['http://localhost:3000'];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
  });

  // Global validation pipe — enforces DTO validation on all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const port = process.env.PORT ?? 9000;
  // Listen on 0.0.0.0 so external cloud providers (like Render) can route traffic to it
  await app.listen(port, '0.0.0.0');
  console.log(`Autocomplete API running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});
