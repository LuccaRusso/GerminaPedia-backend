// src/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { WikiGateway } from './wiki.gateway';

@Module({
  providers: [WikiGateway],
  exports: [WikiGateway],
})
export class WebsocketModule {}
