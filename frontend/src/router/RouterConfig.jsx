import { Navigate, Route, Routes } from 'react-router-dom'
import ROUTES from './routes.config.js'
import RequireRole from './RequireRole.jsx'
import LoginPage from '../modules/login/page/LoginPage.jsx'
import RegisterPage from '../modules/register/page/RegisterPage.jsx'
import CreateRoomPage from '../modules/gameroom/pages/CreateRoomPage.jsx'
import GameroomPage from '../modules/gameroom/pages/GameroomPage.jsx'
import SettingPage from '../modules/startingpage/pages/SettingPage.jsx'
import { MainMenu } from '../modules/startingpage/pages/MainMenu.jsx'
import { JoinMatch } from '../modules/startingpage/pages/JoinMatch.jsx'
import { HowToPlay } from '../modules/startingpage/pages/HowToPlay.jsx'
import { Profile } from '../modules/startingpage/pages/Profile.jsx'
import { MatchHistory } from '../modules/startingpage/pages/MatchHistory.jsx'
import { MatchReplay } from '../modules/startingpage/pages/MatchReplay.jsx'
import { Subscription } from '../modules/startingpage/pages/Subscription.jsx'
import { AdminPanel } from '../modules/startingpage/pages/AdminPanel.jsx'
import { GameLoadingPage } from '../modules/startingpage/pages/GameLoadingPage.jsx'
import { GameVsComputer } from '../modules/startingpage/pages/GameVsComputer.jsx'
import { GameVsFriend } from '../modules/startingpage/pages/GameVsFriend.jsx'
import { NotFound } from '../modules/startingpage/pages/NotFound.jsx'
import { Forbidden403 } from '../modules/startingpage/pages/Forbidden403.jsx'

const getDefaultRoute = () => (localStorage.getItem('token') ? ROUTES.MAIN_MENU : ROUTES.LOGIN)

const RouterConfig = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<Navigate to={getDefaultRoute()} replace />} />
    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
    <Route path={ROUTES.MAIN_MENU} element={<MainMenu />} />
    <Route path={ROUTES.CREATE_ROOM} element={<CreateRoomPage />} />
    <Route path={ROUTES.CREATE_MATCH} element={<CreateRoomPage />} />
    <Route path={ROUTES.GAMEROOM} element={<GameroomPage />} />
    <Route path={ROUTES.JOIN_MATCH} element={<JoinMatch />} />
    <Route path={ROUTES.HOW_TO_PLAY} element={<HowToPlay />} />
    <Route path={ROUTES.PROFILE} element={<Profile />} />
    <Route path={ROUTES.MATCH_HISTORY} element={<MatchHistory />} />
    <Route path={ROUTES.MATCH_REPLAY} element={<MatchReplay />} />
    <Route path={ROUTES.SETTINGS} element={<SettingPage />} />
    <Route path={ROUTES.SETTING_PAGE} element={<SettingPage />} />
    <Route path={ROUTES.SUBSCRIPTION} element={<Subscription />} />
    <Route
      path={ROUTES.ADMIN}
      element={(
        <RequireRole role="admin">
          <AdminPanel />
        </RequireRole>
      )}
    />
    <Route path={ROUTES.FORBIDDEN} element={<Forbidden403 />} />
    <Route path={ROUTES.GAME_LOADING} element={<GameLoadingPage />} />
    <Route path={ROUTES.VS_COMPUTER} element={<GameVsComputer />} />
    <Route path={ROUTES.VS_FRIEND} element={<GameVsFriend />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default RouterConfig
