import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class SseService {
  private clients: Map<string, Response> = new Map();

  addClient(clientId: string, res: Response): void {
    this.clients.set(clientId, res);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  emitEvent(event: string, data: any): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((res, clientId) => {
      try {
        res.write(message);
      } catch {
        this.removeClient(clientId);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
