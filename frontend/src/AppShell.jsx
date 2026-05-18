import RouterConfig from './router/RouterConfig'
import { usePresenceHeartbeat } from './modules/social/hooks/usePresenceHeartbeat.js'

export default function AppShell() {
  usePresenceHeartbeat()

  return <RouterConfig />
}
