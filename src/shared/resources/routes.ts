import { createBrowserRouter } from 'react-router'
import { RoutePath } from './enums'
import CityPage from '@/features/weather/pages/city-page/city-page'
import WeatherDashboard from '@/features/weather/pages/dashboard-page/weather-dashboard'
import App from '@/App'

export const routes = createBrowserRouter([
  {
    path: RoutePath.Root,
    Component: App,
    children: [
      {
        index: true,
        Component: WeatherDashboard,
      },
      {
        path: RoutePath.City,
        Component: CityPage,
      },
    ],
  },
])
