import { useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import Stomp, { Client } from 'stompjs'
import type { NotificationMessage } from '@/types'
import { normalizeNotification } from '@/utils/notification'

type VnpayHandler = (notification: NotificationMessage) => void

/**
 * Hook kết nối WebSocket và lắng nghe các thông báo từ /topic/notifications.
 * Trả về hàm `registerVnpay(orderId, handler)` để đăng ký callback cho một đơn cụ thể.
 * Khi nhận được VNPAY_SUCCESS khớp orderId, handler được gọi 1 lần rồi tự hủy.
 */
export function usePaymentSocket() {
  const clientRef = useRef<Client | null>(null)
  // orderId -> handler
  const listenersRef = useRef<Map<string, VnpayHandler>>(new Map())

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const client = Stomp.over(socket)
    client.debug = () => {} // tắt log debug

    client.connect(
      {},
      () => {
        clientRef.current = client
        client.subscribe('/topic/notifications', (msg) => {
          try {
            const raw = JSON.parse(msg.body) as unknown
            const notif = normalizeNotification(raw)
            if (!notif) return

            if (notif.type === 'VNPAY_SUCCESS' && notif.orderId) {
              const handler = listenersRef.current.get(notif.orderId)
              if (handler) {
                handler(notif)
                listenersRef.current.delete(notif.orderId)
              }
            }
          } catch {
            // parse error — bỏ qua
          }
        })
      },
      (_err) => {
        // kết nối thất bại — bỏ qua, không crash app
      },
    )

    return () => {
      try {
        if (client.connected) {
          client.disconnect(() => {})
        }
      } catch {
        // ignore
      }
    }
  }, [])

  /** Đăng ký callback khi thanh toán VNPAY thành công cho orderId */
  const registerVnpay = (orderId: string, handler: VnpayHandler) => {
    listenersRef.current.set(orderId, handler)
  }

  /** Hủy đăng ký (dùng khi tab bị đóng trước khi thanh toán xong) */
  const unregisterVnpay = (orderId: string) => {
    listenersRef.current.delete(orderId)
  }

  return { registerVnpay, unregisterVnpay }
}
