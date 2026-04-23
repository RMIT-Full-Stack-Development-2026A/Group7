import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from '../modules/login/page/LoginPage'
import RegisterPage from '../modules/register/page/RegisterPage'
import GameroomPage from '../modules/gameroom/pages/GameroomPage'
import CreateRoomPage from '../modules/gameroom/pages/CreateRoomPage'
import { AdminPanel } from '../modules/startingpage/pages/AdminPanel'
import { CasualGame } from '../modules/startingpage/pages/CasualGame'
import { GameVsComputer } from '../modules/startingpage/pages/GameVsComputer'
import { GameVsFriend } from '../modules/startingpage/pages/GameVsFriend'
import { HowToPlay } from '../modules/startingpage/pages/HowToPlay'
import { JoinMatch } from '../modules/startingpage/pages/JoinMatch'
import { Mailbox } from '../modules/startingpage/pages/Mailbox'
import { MainMenu } from '../modules/startingpage/pages/MainMenu'
import { NotFound } from '../modules/startingpage/pages/NotFound'
import { Profile } from '../modules/startingpage/pages/Profile'
import { CompetitiveMode } from '../modules/startingpage/pages/RankedMode.jsx'
import SettingPage from '../modules/startingpage/pages/SettingPage'
import { SpecialModes } from '../modules/startingpage/pages/SpecialModes.jsx'
import { Subscription } from '../modules/startingpage/pages/Subscription'
import ROUTES from './routes.config.js'

const hasAuthSession = () => Boolean(localStorage.getItem('token'))

const getStoredRole = () => {
  try {
    const u = JSON.parse(localStorage.getItem('authUser') || '{}')
    return u?.role || null
  } catch { return null }
}

const ProtectedLayout = () => {
  if (!hasAuthSession()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  return <Outlet />
}

// Separate guard for admin-only routes
// Players who try to visit /admin directly are sent back to main menu
const AdminOnlyLayout = () => {
  if (!hasAuthSession()) return <Navigate to={ROUTES.LOGIN} replace />
  if (getStoredRole() !== 'admin') return <Navigate to={ROUTES.MAIN_MENU} replace />
  return <Outlet />
}

const PublicOnlyLayout = () => {
  return <Outlet />
}

const RouterConfig = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

    <Route element={<PublicOnlyLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedLayout />}>
      <Route path={ROUTES.MAIN_MENU} element={<MainMenu />} />
      <Route path={ROUTES.CREATE_ROOM} element={<CreateRoomPage />} />
      <Route path={ROUTES.GAMEROOM} element={<GameroomPage />} />
      <Route path={ROUTES.CREATE_MATCH} element={<CreateRoomPage />} />
      <Route path={ROUTES.JOIN_MATCH} element={<JoinMatch />} />
      <Route path={ROUTES.CASUAL_GAME} element={<CasualGame />} />
      <Route path={ROUTES.COMPETITIVE_MODE} element={<CompetitiveMode />} />
      <Route path={ROUTES.HOW_TO_PLAY} element={<HowToPlay />} />
      <Route path={ROUTES.PROFILE} element={<Profile />} />
      <Route path={ROUTES.MAILBOX} element={<Mailbox />} />
      <Route path={ROUTES.SETTINGS} element={<SettingPage />} />
      <Route path={ROUTES.SETTING_PAGE} element={<Navigate to={ROUTES.SETTINGS} replace />} />
      <Route path={ROUTES.SPECIAL_MODES} element={<SpecialModes />} />
      <Route path={ROUTES.SUBSCRIPTION} element={<Subscription />} />
      <Route path={ROUTES.VS_COMPUTER} element={<GameVsComputer />} />
      <Route path={ROUTES.VS_FRIEND} element={<GameVsFriend />} />
    </Route>

    <Route element={<AdminOnlyLayout />}>
      <Route path={ROUTES.ADMIN} element={<AdminPanel />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default RouterConfig
