class SocketManager {
  constructor() {
    if (SocketManager.instance) return SocketManager.instance
    this.socket = null
    this.isConnected = false
    this.subscribedChannels = new Set()
    this.messageHandlers = new Map()
    this.reconnectDelay = 3000
    this.url = null
    this.reconnectTimeout = null
    SocketManager.instance = this
  }

  connect(url) {
    if (this.socket) return
    this.url = url
    this._connect()
  }

  _connect() {
    this.socket = new WebSocket(this.url)
    this.socket.onopen = () => {
      this.isConnected = true
      this.subscribedChannels.forEach(channel => {
        this.send({ subscribe: channel })
      })
    }
    this.socket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data)
        Object.entries(payload).forEach(([key, data]) => {
          if (this.messageHandlers.has(key)) {
            this.messageHandlers.get(key).forEach(fn => fn(data))
          }
        })
      } catch {}
    }
    this.socket.onclose = () => {
      this.isConnected = false
      this.socket = null
      this.reconnectTimeout = setTimeout(() => this._connect(), this.reconnectDelay)
    }
    this.socket.onerror = () => {
      if (this.socket) this.socket.close()
    }
  }

  send(data) {
    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    }
  }

  subscribe(channel) {
    if (!this.subscribedChannels.has(channel)) {
      this.subscribedChannels.add(channel)
      if (this.isConnected) this.send({ subscribe: channel })
    }
  }

  unsubscribe(channel) {
    if (this.subscribedChannels.has(channel)) {
      this.subscribedChannels.delete(channel)
      if (this.isConnected) this.send({ unsubscribe: channel })
    }
  }

  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type).push(handler)
  }

  offMessage(type, handler) {
    if (!this.messageHandlers.has(type)) return
    const handlers = this.messageHandlers.get(type).filter(h => h !== handler)
    if (handlers.length) {
      this.messageHandlers.set(type, handlers)
    } else {
      this.messageHandlers.delete(type)
    }
  }

  close() {
    if (this.socket) this.socket.close()
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
    this.socket = null
    this.isConnected = false
    this.subscribedChannels.clear()
    this.messageHandlers.clear()
  }
}

const socketManager = new SocketManager()
socketManager.connect(import.meta.env.VITE_SOCKET_ENDPOINT)
export default socketManager
