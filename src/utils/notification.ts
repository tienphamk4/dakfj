import type { NotificationMessage } from '@/types'

type NotificationRaw = Partial<NotificationMessage> & {
  tieuDe?: string
  noiDung?: string
  loai?: string
  hoaDonId?: string
  ngayTao?: string | Date
}

/**
 * Chuyển payload notification từ BE về format thống nhất cho FE.
 * Hỗ trợ cả key tiếng Anh mới và key tiếng Việt cũ để tránh vỡ tương thích.
 */
export const normalizeNotification = (raw: unknown): NotificationMessage | null => {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as NotificationRaw
  const id = data.id ? String(data.id) : ''
  const title = data.title ?? data.tieuDe ?? ''
  const message = data.message ?? data.noiDung ?? ''
  const type = data.type ?? data.loai ?? ''
  const orderId = data.orderId ?? data.hoaDonId ?? undefined
  const createdAt = data.createdAt ?? data.ngayTao ?? undefined

  if (!id || !title || !message || !type) return null

  return {
    id,
    title,
    message,
    type,
    status: data.status,
    orderId: orderId ? String(orderId) : undefined,
    createdAt,
  }
}