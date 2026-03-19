// src/wikis/wikis.module.ts
import { Module } from '@nestjs/common';
import { WikisController } from './wikis.controller';
import { WikisService } from './wikis.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [WikisController],
  providers: [WikisService],
  exports: [WikisService],
})
export class WikisModule {}
