const trimTrailingSlash = (value = '') => String(value).replace(/\/+$/, '')

const getBrowserOrigin = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  return window.location.origin
}

export const getBackendOrigin = () =>
  trimTrailingSlash(import.meta.env.VITE_BACKEND_ORIGIN || import.meta.env.VITE_SOCKET_BASE_URL || getBrowserOrigin())

export const getApiBaseUrl = () =>
  trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || `${getBrowserOrigin()}/api`)

export const getSocketBaseUrl = () =>
  trimTrailingSlash(import.meta.env.VITE_SOCKET_BASE_URL || getBrowserOrigin())
