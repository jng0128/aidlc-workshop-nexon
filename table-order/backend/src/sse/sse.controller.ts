import { Controller, Get, Query, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('orders')
  async subscribe(
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    // Validate JWT token from query param (EventSource can't set headers)
    if (!token) {
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    try {
      this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Register client
    const clientId = randomUUID();
    this.sseService.addClient(clientId, res);

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    // Heartbeat interval (30 seconds)
    const heartbeat = setInterval(() => {
      try {
        res.write(`event: ping\ndata: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
      } catch {
        clearInterval(heartbeat);
        this.sseService.removeClient(clientId);
      }
    }, 30000);

    // Cleanup on connection close
    res.on('close', () => {
      clearInterval(heartbeat);
      this.sseService.removeClient(clientId);
    });
  }
}
