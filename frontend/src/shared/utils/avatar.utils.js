import MamboAvatar from '../assets/images/Mambo.png'
import { getBackendOrigin } from '../../config/api/baseUrl.js'

export const AI_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDSVVP_wL7wjVO9MdHRFNITzjGa_LYBJNgA&s'

const BACKEND_ORIGIN = getBackendOrigin()

export const resolveAvatarUrl = (avatar, { isAI = false, fallbackToDefault = true } = {}) => {
  if (!avatar || avatar === 'Mambo.png') {
    if (!fallbackToDefault) {
      return ''
    }

    return isAI ? AI_AVATAR : MamboAvatar
  }

  if (avatar.startsWith('blob:')) {
    if (!fallbackToDefault) {
      return ''
    }

    return isAI ? AI_AVATAR : MamboAvatar
  }

  if (
    avatar.startsWith('http')
    || avatar.startsWith('data:')
  ) {
    return avatar
  }

  if (avatar.startsWith('/')) {
    return `${BACKEND_ORIGIN}${avatar}`
  }

  return `${BACKEND_ORIGIN}/${avatar.replace(/^\/+/, '')}`
}

export const getRawAvatarValue = (avatar = '') => {
  const value = String(avatar || '')

  if (!value || value === MamboAvatar || value.includes('/assets/Mambo') || value.includes('\\assets\\Mambo')) {
    return ''
  }

  return value
}

export { MamboAvatar }
