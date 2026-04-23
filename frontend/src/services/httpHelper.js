const DEFAULT_TIMEOUT_MS = 8000

const request = async (url, method = 'GET', body = null, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const token = localStorage.getItem('token')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
    }

    if (body) options.body = JSON.stringify(body)

    const response = await fetch(url, options)
    const data = await response.json().catch(() => ({}))
    return { data, status: response.status, ok: response.ok }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        data: {
          message: `Request timed out after ${Math.round(timeoutMs / 1000)} seconds.`,
        },
        status: 408,
        ok: false,
      }
    }

    return {
      data: {
        message: error.message || 'Network request failed.',
      },
      status: 0,
      ok: false,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export const httpHelper = {
  get:    (url, h, timeoutMs)       => request(url, 'GET',    null, h, timeoutMs),
  post:   (url, body, h, timeoutMs) => request(url, 'POST',   body, h, timeoutMs),
  put:    (url, body, h, timeoutMs) => request(url, 'PUT',    body, h, timeoutMs),
  patch:  (url, body, h, timeoutMs) => request(url, 'PATCH',  body, h, timeoutMs),
  delete: (url, h, timeoutMs)       => request(url, 'DELETE', null, h, timeoutMs),
}
