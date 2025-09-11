import { WebSocketMessage } from './types'

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectInterval: NodeJS.Timeout | null = null
  private messageHandlers: ((message: WebSocketMessage) => void)[] = []

  connect(url: string = `ws://${window.location.host}/api/websocket`) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval)
          this.reconnectInterval = null
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.messageHandlers.forEach(handler => handler(message))
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect(url)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.attemptReconnect(url)
    }
  }

  private attemptReconnect(url: string) {
    if (this.reconnectInterval) return

    this.reconnectInterval = setInterval(() => {
      console.log('Attempting to reconnect WebSocket...')
      this.connect(url)
    }, 5000)
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler)
  }

  removeMessageHandler(handler: (message: WebSocketMessage) => void) {
    const index = this.messageHandlers.indexOf(handler)
    if (index > -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  subscribe(restaurantId: string) {
    this.send({
      type: 'booking_update',
      data: { action: 'subscribe', restaurantId },
      restaurantId,
      timestamp: new Date()
    })
  }

  unsubscribe(restaurantId: string) {
    this.send({
      type: 'booking_update',
      data: { action: 'unsubscribe', restaurantId },
      restaurantId,
      timestamp: new Date()
    })
  }
}

export const wsManager = new WebSocketManager()

// Custom hook for WebSocket functionality
export function useWebSocket() {
  const connect = () => wsManager.connect()
  const disconnect = () => wsManager.disconnect()
  const send = (message: WebSocketMessage) => wsManager.send(message)
  const onMessage = (handler: (message: WebSocketMessage) => void) => wsManager.onMessage(handler)
  const removeHandler = (handler: (message: WebSocketMessage) => void) => wsManager.removeMessageHandler(handler)
  const subscribe = (restaurantId: string) => wsManager.subscribe(restaurantId)
  const unsubscribe = (restaurantId: string) => wsManager.unsubscribe(restaurantId)

  return {
    connect,
    disconnect,
    send,
    onMessage,
    removeHandler,
    subscribe,
    unsubscribe
  }
}