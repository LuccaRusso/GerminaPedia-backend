// src/websocket/wiki.gateway.ts
// Gateway Socket.IO para atualizações em tempo real das wikis
//
// DECISÃO: Socket.IO sobre SSE porque:
//   - Bidirecional: clientes podem enviar eventos também (ex: "estou editando agora")
//   - Rooms nativas: clientes entram na "sala" da wiki específica
//   - Reconexão automática e fallback para long-polling
//   - Escala com Redis Adapter (quando necessário em produção)

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173', // Vite dev
      'http://localhost:3000',
      process.env.FRONTEND_URL ?? 'http://localhost:5173',
    ],
    credentials: true,
  },
  namespace: '/wiki', // namespace dedicado para wikis
})
export class WikiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WikiGateway.name);

  // Mapa: socketId → lista de wikiIds que o cliente está "assistindo"
  private activeEditors = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.debug(`Cliente conectado: ${client.id}`);
    this.activeEditors.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente desconectado: ${client.id}`);
    const wikiIds = this.activeEditors.get(client.id);

    // Notifica que o editor saiu (para mostrar "usuário saiu" na UI)
    if (wikiIds) {
      wikiIds.forEach((wikiId) => {
        client.to(`wiki:${wikiId}`).emit('editor:left', {
          socketId: client.id,
          wikiId,
        });
      });
    }

    this.activeEditors.delete(client.id);
  }

  // ─── Entrar na "sala" de uma wiki ────────────────────────
  // O cliente deve chamar isso ao abrir uma wiki para receber updates dela
  @SubscribeMessage('wiki:join')
  handleJoinWiki(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { wikiId: string; userId?: string; userName?: string },
  ) {
    const roomName = `wiki:${data.wikiId}`;
    client.join(roomName);

    // Registra o wikiId nos editores ativos desse socket
    this.activeEditors.get(client.id)?.add(data.wikiId);

    // Notifica outros usuários na mesma wiki
    client.to(roomName).emit('editor:joined', {
      socketId: client.id,
      userId: data.userId,
      userName: data.userName ?? 'Anônimo',
      wikiId: data.wikiId,
    });

    this.logger.debug(`${client.id} entrou na wiki: ${data.wikiId}`);
    return { success: true, room: roomName };
  }

  // ─── Sair da "sala" de uma wiki ──────────────────────────
  @SubscribeMessage('wiki:leave')
  handleLeaveWiki(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { wikiId: string },
  ) {
    const roomName = `wiki:${data.wikiId}`;
    client.leave(roomName);
    this.activeEditors.get(client.id)?.delete(data.wikiId);

    client.to(roomName).emit('editor:left', {
      socketId: client.id,
      wikiId: data.wikiId,
    });
  }

  // ─── Indicador de digitação ("está editando...") ─────────
  @SubscribeMessage('wiki:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { wikiId: string; userName: string },
  ) {
    client.to(`wiki:${data.wikiId}`).emit('editor:typing', {
      socketId: client.id,
      userName: data.userName,
      wikiId: data.wikiId,
    });
  }

  // ─── Métodos chamados pelo WikisService ──────────────────

  // Emite para TODOS os clientes quando uma wiki é criada
  emitWikiCreated(wiki: any) {
    this.server.emit('wiki:created', {
      id: wiki.id,
      slug: wiki.slug,
      titulo: wiki.titulo,
      tipo: wiki.tipo,
      criadoPor: wiki.criadoPor,
      updatedAt: wiki.updatedAt,
    });
  }

  // Emite apenas para clientes que estão na "sala" dessa wiki
  emitWikiUpdated(wiki: any) {
    this.server.to(`wiki:${wiki.id}`).emit('wiki:updated', wiki);

    // Também emite um evento global mais leve para listas/índices
    this.server.emit('wiki:changed', {
      id: wiki.id,
      slug: wiki.slug,
      titulo: wiki.titulo,
      updatedAt: wiki.updatedAt,
    });
  }

  // Emite para TODOS quando uma wiki é deletada
  emitWikiDeleted(wikiId: string) {
    this.server.emit('wiki:deleted', { id: wikiId });
  }
}
