const trimTrailingSlash = (value = '') => String(value).replace(/\/+$/, '')

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

const getBrowserOrigin = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  return window.location.origin
}

const isLocalOrigin = (origin) => {
  try {
    return LOCAL_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}

const preferBrowserOriginForPublicClient = (configuredOrigin, fallbackPath = '') => {
  const browserOrigin = getBrowserOrigin()
  const normalizedConfiguredOrigin = trimTrailingSlash(configuredOrigin)

  if (
    normalizedConfiguredOrigin &&
    isLocalOrigin(normalizedConfiguredOrigin) &&
    !isLocalOrigin(browserOrigin)
  ) {
    return `${trimTrailingSlash(browserOrigin)}${fallbackPath}`
  }

  return normalizedConfiguredOrigin || `${trimTrailingSlash(browserOrigin)}${fallbackPath}`
}

export const getBackendOrigin = () =>
  preferBrowserOriginForPublicClient(import.meta.env.VITE_BACKEND_ORIGIN || import.meta.env.VITE_SOCKET_BASE_URL)

export const getApiBaseUrl = () =>
  preferBrowserOriginForPublicClient(
    import.meta.env.VITE_API_BASE_URL || (
      import.meta.env.VITE_BACKEND_ORIGIN
        ? `${trimTrailingSlash(import.meta.env.VITE_BACKEND_ORIGIN)}/api`
        : ''
    ),
    '/api'
  )

export const getSocketBaseUrl = () =>
  preferBrowserOriginForPublicClient(import.meta.env.VITE_SOCKET_BASE_URL || import.meta.env.VITE_BACKEND_ORIGIN)
