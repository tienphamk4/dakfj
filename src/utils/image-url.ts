const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8080'

const extractFileName = (value: string): string => {
  const cleaned = value.split('?')[0].split('#')[0]
  const segments = cleaned.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? ''
}

export const resolveImageUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined
  if (/^data:image\//i.test(value)) return value

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value)
      const apiHost = new URL(API_BASE_URL).host
      // Treat same-host or local hosts (localhost/127.0.0.1) or explicit /images paths
      const isLocalHost = ['localhost', '127.0.0.1'].includes(parsed.hostname)
      const isImagesPath = parsed.pathname && parsed.pathname.startsWith('/images/')
      if (parsed.host !== apiHost && !isLocalHost && !isImagesPath) return value
      const fileName = extractFileName(parsed.pathname)
      return fileName ? `${API_BASE_URL}/images/${fileName}` : undefined
    } catch {
      return value
    }
  }

  if (value.startsWith('/images/')) {
    return `${API_BASE_URL}${value}`
  }

  const fileName = extractFileName(value)
  return fileName ? `${API_BASE_URL}/images/${fileName}` : undefined
}