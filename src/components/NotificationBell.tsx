import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Popover, List, Button, Empty, Typography, Tag } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { getUnreadNotifications, markNotificationRead } from '@/services/notification.service'
import type { NotificationMessage } from '@/types'
import { normalizeNotification } from '@/utils/notification'

/** Xác định route điều hướng khi click vào thông báo */
const resolveOrderPath = (notif: NotificationMessage, role: 'admin' | 'employee') => {
  if (!notif.orderId) return null
  if (role === 'admin') return `/admin/orders/${notif.orderId}`
  return `/employee/orders/${notif.orderId}`
}

interface Props {
  role: 'admin' | 'employee'
}

const formatNotificationTime = (value?: string | Date) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ trước`

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationBell({ role }: Props) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationMessage[]>([])
  const [open, setOpen] = useState(false)
  const seenIdsRef = useRef<Set<string>>(new Set())

  const prependNotification = (notif: NotificationMessage) => {
    if (seenIdsRef.current.has(notif.id)) return false
    seenIdsRef.current.add(notif.id)
    setNotifications(prev => [notif, ...prev])
    return true
  }

  // ── Load thông báo chưa đọc khi mount ──────────────────────────────────────
  useEffect(() => {
    getUnreadNotifications()
      .then((res) => {
        const mapped = (res.data.data ?? [])
          .map(normalizeNotification)
          .filter((n): n is NotificationMessage => n !== null)

        seenIdsRef.current = new Set(mapped.map(n => n.id))
        setNotifications(mapped)
      })
      .catch(() => {/* bỏ qua nếu API lỗi */})
  }, [])

  // ── Kết nối WebSocket & lắng nghe realtime ─────────────────────────────────
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const client = Stomp.over(socket)
    client.debug = () => {}

    client.connect(
      {},
      () => {
        client.subscribe('/topic/notifications', (msg) => {
          try {
            const raw = JSON.parse(msg.body) as unknown
            const notif = normalizeNotification(raw)
            if (!notif) return

            const added = prependNotification(notif)
            if (!added) return
          } catch {
            // bỏ qua
          }
        })
      },
      () => {/* kết nối thất bại — im lặng */},
    )

    return () => {
      try {
        if (client.connected) client.disconnect(() => {})
      } catch { /* ignore */ }
    }
  }, [])

  // ── Xử lý click vào 1 thông báo ────────────────────────────────────────────
  const handleClickNotif = async (notif: NotificationMessage) => {
    setOpen(false)
    // Đánh dấu đã đọc (fire & forget)
    markNotificationRead(notif.id).catch(() => {})
    // Xóa khỏi danh sách badge
    setNotifications((prev) => {
      const next = prev.filter(n => n.id !== notif.id)
      seenIdsRef.current.delete(notif.id)
      return next
    })
    // Điều hướng đến trang chi tiết đơn
    const path = resolveOrderPath(notif, role)
    if (!path) {
      return
    }
    navigate(path)
  }

  const unreadCount = notifications.length

  // ── Nội dung popover ────────────────────────────────────────────────────────
  const content = (
    <div className="notif-panel" style={{ width: 360, maxHeight: 430, overflowY: 'auto' }}>
      {notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo mới" style={{ padding: '22px 0' }} />
      ) : (
        <List
          dataSource={notifications}
          split={false}
          renderItem={notif => (
            <List.Item
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: 'none' }}
              className="notif-item"
              onClick={() => handleClickNotif(notif)}
              actions={[
                <Button
                  key="read"
                  type="text"
                  size="small"
                  className="notif-read-btn"
                  icon={<CheckOutlined />}
                  onClick={e => { e.stopPropagation(); handleClickNotif(notif) }}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="notif-dot" />
                    <Tag
                      color={notif.type === 'VNPAY_SUCCESS' ? 'green' : 'blue'}
                      style={{ fontSize: 10, margin: 0 }}
                    >
                      {notif.type === 'VNPAY_SUCCESS' ? 'VNPAY' : 'Đơn mới'}
                    </Tag>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 600, lineHeight: '18px' }}>{notif.title}</Typography.Text>
                  </div>
                }
                description={
                  <div style={{ marginTop: 4, paddingLeft: 18 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: '18px' }}>
                      {notif.message}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {formatNotificationTime(notif.createdAt)}
                    </Typography.Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  return (
    <>
      <style>{`
        .notif-panel {
          background: linear-gradient(180deg, #f9fbff 0%, #ffffff 80%);
        }
        .notif-item {
          border-radius: 10px;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .notif-item:hover {
          background: #eef4ff !important;
          transform: translateX(2px);
        }
        .notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1677ff;
          box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.14);
          flex-shrink: 0;
        }
        .notif-read-btn {
          color: #8b95a7 !important;
        }
        .notif-read-btn:hover {
          color: #1677ff !important;
          background: rgba(22, 119, 255, 0.08) !important;
        }
        .notif-bell:hover {
          background: #f1f4fb;
        }
      `}</style>
      <Popover
        content={content}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f0f2f5' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  seenIdsRef.current.clear()
                  setNotifications([])
                }}
                style={{ padding: 0, fontSize: 12 }}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        }
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        overlayStyle={{ padding: 0 }}
        overlayInnerStyle={{ padding: 0, borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 35px rgba(14, 25, 43, 0.15)' }}
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <BellOutlined
            style={{
              fontSize: 20,
              cursor: 'pointer',
              color: '#555',
              padding: '4px 6px',
              borderRadius: 6,
              transition: 'background 0.15s',
            }}
            className="notif-bell"
          />
        </Badge>
      </Popover>
    </>
  )
}
