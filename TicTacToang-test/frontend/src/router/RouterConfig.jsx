import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage    from '../modules/login/page/LoginPage'
import RegisterPage from '../modules/register/page/RegisterPage'
import GameroomPage from '../modules/gameroom/pages/GameroomPage'
import CreateRoomPage from '../modules/gameroom/pages/CreateRoomPage'

// Teammates thêm route ở đây:
// import HomePage    from '../modules/home/page/HomePage'
// import GamePage    from '../modules/game/page/GamePage'
// import ProfilePage from '../modules/profile/page/ProfilePage'
// import AdminPage   from '../modules/admin/page/AdminPage'

const RouterConfig = () => (
  <Routes>
    <Route path="/"         element={<Navigate to="/login" replace />} />
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/createroom" element={<CreateRoomPage/>} />
    <Route path="/gameroom" element={<GameroomPage />} />
    <Route path="*"         element={<Navigate to="/login" replace />} />
    
    {/* Teammates thêm vào đây */}
    {/* <Route path="/home"    element={<HomePage />} /> */}
    {/* <Route path="/game"    element={<GamePage />} /> */}
    {/* <Route path="/profile" element={<ProfilePage />} /> */}
    {/* <Route path="/admin"   element={<AdminPage />} /> */}
  </Routes>
)

export default RouterConfig
