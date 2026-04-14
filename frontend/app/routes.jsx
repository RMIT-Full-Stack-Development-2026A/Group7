import { createBrowserRouter } from "react-router";
import { MainMenu } from "../pages/MainMenu";
import { CreateMatch } from "../pages/CreateMatch";
import { CasualGame } from "../pages/CasualGame";
import { RankedMode } from "../pages/RankedMode";
import { GameVsComputer } from "../pages/GameVsComputer";
import { GameVsFriend } from "../pages/GameVsFriend";
import { HowToPlay } from "../pages/HowToPlay";
import SettingPage from "../pages/SettingPage";
import { Mailbox } from "../pages/Mailbox";
import { AdminPanel } from "../pages/AdminPanel";
import { Subscription } from "../pages/Subscription";
import { Profile } from "../pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainMenu,
  },
  {
    path: "/create-match",
    Component: CreateMatch,
  },
  {
    path: "/casual-game",
    Component: CasualGame,
  },
  {
    path: "/ranked-mode",
    Component: RankedMode,
  },
  {
    path: "/vs-computer",
    Component: GameVsComputer,
  },
  {
    path: "/vs-friend",
    Component: GameVsFriend,
  },
  {
    path: "/how-to-play",
    Component: HowToPlay,
  },
  {
    path: "/settings",
    Component: SettingPage,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/mailbox",
    Component: Mailbox,
  },
  {
    path: "/admin",
    Component: AdminPanel,
  },
  {
    path: "/subscription",
    Component: Subscription,
  }
]);
