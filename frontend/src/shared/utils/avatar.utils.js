import MamboAvatar from '../assets/images/Mambo.png'
import { getBackendOrigin } from '../../config/api/baseUrl.js'

export const AI_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDSVVP_wL7wjVO9MdHRFNITzjGa_LYBJNgA&s'

const BACKEND_ORIGIN = getBackendOrigin()

// Paths that look like a bundled or asset URL (built by Vite/webpack).
// These resolve correctly for the browser that produced them, but break for
// any other browser, so we treat them as "no avatar set" when normalizing for
// network transmission and fall back to the shared default for rendering.
const isBundledAssetPath = (value = '') => {
  const normalized = String(value || '').toLowerCase()
  return (
    normalized.includes('/assets/mambo')
    || normalized.includes('\\assets\\mambo')
    || /\/assets\/[^/]+-[a-f0-9]{6,}\.[a-z]+$/i.test(normalized)
  )
}

const isUnshareableAvatar = (value = '') => {
  const normalized = String(value || '')
  if (!normalized) return true
  if (normalized === 'Mambo.png') return true
  if (normalized.startsWith('blob:')) return true
  if (normalized.startsWith('file:')) return true
  if (isBundledAssetPath(normalized)) return true
  return false
}

export const resolveAvatarUrl = (avatar, { isAI = false, fallbackToDefault = true } = {}) => {
  const value = avatar == null ? '' : String(avatar)

  if (!value || value === 'Mambo.png') {
    if (!fallbackToDefault) {
      return ''
    }

    return isAI ? AI_AVATAR : MamboAvatar
  }

  if (value.startsWith('blob:') || value.startsWith('file:')) {
    if (!fallbackToDefault) {
      return ''
    }

    return isAI ? AI_AVATAR : MamboAvatar
  }

  if (
    value.startsWith('http')
    || value.startsWith('data:')
  ) {
    return value
  }

  if (value.startsWith('/')) {
    return `${BACKEND_ORIGIN}${value}`
  }

  return `${BACKEND_ORIGIN}/${value.replace(/^\/+/, '')}`
}

// Strip avatar values that only make sense locally (Vite-bundled paths, blob
// URLs, the literal 'Mambo.png' placeholder) so they aren't broadcast to other
// clients. Returns a value that is safe to send over the socket or persist.
export const sanitizeAvatarForTransport = (avatar = '') => {
  const value = avatar == null ? '' : String(avatar)
  if (isUnshareableAvatar(value)) return ''
  return value
}

export const getRawAvatarValue = (avatar = '') => {
  const value = String(avatar || '')

  if (!value || value === MamboAvatar || value.includes('/assets/Mambo') || value.includes('\\assets\\Mambo')) {
    return ''
  }

  return value
}

export { MamboAvatar }
