import MamboAvatar from '../assets/images/Mambo.png'

export const AI_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDSVVP_wL7wjVO9MdHRFNITzjGa_LYBJNgA&s'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/api$/, '')

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

export const getRawAvatarValue = (avatar) => (
  avatar === MamboAvatar ? '' : (avatar || '')
)

export { MamboAvatar }
