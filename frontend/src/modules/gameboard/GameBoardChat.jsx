import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChatBar } from '../gameroom/components/ChatBar/ChatBar.jsx'
import { gameroomService } from '../gameroom/services/gameroomService.js'
import { gameroomSocketService } from '../gameroom/services/gameroomSocketService.js'
import { getStoredAuthIdentity, resolveAuthIdentity } from '../gameroom/utils/authIdentity.js'

const CHAT_REFRESH_INTERVAL_MS = 4000

export default function GameBoardChat({ roomData }) {
  const [authIdentity, setAuthIdentity] = useState(() => getStoredAuthIdentity())
  const [messages, setMessages] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const roomId = roomData?.roomId
  const roomMongoId = roomData?._id

  useEffect(() => {
    let isActive = true
    resolveAuthIdentity().then((identity) => {
      if (isActive) setAuthIdentity(identity)
    }).catch(() => {})
    return () => { isActive = false }
  }, [])

  const currentUserId = authIdentity?.userId || authIdentity?.id || 'anonymous'
  const currentUserName = authIdentity?.name || authIdentity?.username || 'Player'

  const normalizeChatMessageForClient = useCallback((message = {}) => {
    const senderId = String(message.senderId || '')
    const isOwn = Boolean(senderId && senderId === String(currentUserId))
    return {
      id: String(message.id || `${message.createdAt || Date.now()}-${senderId}`),
      senderId,
      author: isOwn ? 'You' : (message.senderName || 'Player'),
      text: String(message.text || ''),
      createdAt: message.createdAt,
      isOwn,
    }
  }, [currentUserId])

  useEffect(() => {
    if (!roomId || !roomMongoId) return undefined

    const sanitize = (rawMessages) => rawMessages
      .map(normalizeChatMessageForClient)
      .filter((message) => message.id && message.text)

    const refreshChatHistory = async () => {
      try {
        const roomMessages = await gameroomService.getRoomChatMessages(roomMongoId)
        setMessages(sanitize(roomMessages))
      } catch (error) {
        console.error('Error loading gameboard chat:', error)
      }
    }

    gameroomSocketService.joinRoom({ roomId, playerId: currentUserId, playerName: currentUserName })

    const unsubscribeChatHistory = gameroomSocketService.on('chat-history', (payload = {}) => {
      if (String(payload.roomId) !== String(roomId)) return
      setMessages(sanitize(payload.messages || []))
    })

    const unsubscribeChatMessage = gameroomSocketService.on('chat-message', (payload = {}) => {
      if (String(payload.roomId) !== String(roomId)) return
      const normalized = normalizeChatMessageForClient(payload.message || {})
      if (!normalized.id || !normalized.text) return
      setMessages((current) => (
        current.some((item) => item.id === normalized.id) ? current : [...current, normalized]
      ))
      if (!normalized.isOwn) {
        setUnreadCount((current) => (isCollapsed ? current + 1 : current))
      }
    })

    refreshChatHistory()
    gameroomSocketService.emit('request-chat-history', { roomId })

    const refreshTimer = window.setInterval(refreshChatHistory, CHAT_REFRESH_INTERVAL_MS)

    return () => {
      unsubscribeChatHistory()
      unsubscribeChatMessage()
      window.clearInterval(refreshTimer)
    }
  }, [currentUserId, currentUserName, isCollapsed, normalizeChatMessageForClient, roomId, roomMongoId])

  const handleSendMessage = useCallback(async (text) => {
    const trimmed = String(text || '').trim()
    if (!trimmed || !roomMongoId) return

    try {
      const saved = await gameroomService.sendRoomChatMessage(roomMongoId, {
        senderId: currentUserId,
        senderName: currentUserName,
        text: trimmed,
      })
      const normalized = normalizeChatMessageForClient(saved)
      setMessages((current) => (
        current.some((item) => item.id === normalized.id) ? current : [...current, normalized]
      ))
    } catch (error) {
      console.error('Error sending gameboard chat:', error)
    }
  }, [currentUserId, currentUserName, normalizeChatMessageForClient, roomMongoId])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((current) => {
      if (current) setUnreadCount(0)
      return !current
    })
  }, [])

  const wrapperClassName = useMemo(
    () => `gameboard-chat-wrapper ${isCollapsed ? 'gameboard-chat-collapsed' : 'gameboard-chat-expanded'}`,
    [isCollapsed],
  )

  if (!roomId || !roomMongoId) return null

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        className="gameboard-chat-toggle"
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? 'Open chat' : 'Hide chat'}
      >
        <i className={`bi ${isCollapsed ? 'bi-chat-dots-fill' : 'bi-x-lg'}`} />
        {isCollapsed && unreadCount > 0 ? (
          <span className="gameboard-chat-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>
      {!isCollapsed ? <ChatBar messages={messages} onSendMessage={handleSendMessage} /> : null}
    </div>
  )
}
