export class SocketManager {
  private socket: any;

  setSocket(socket: any) {
    this.socket = socket;
  }

  emit(message: string, data: any) {
    if (!this.socket) return;
    this.socket.emit(message, data);
  }
}
