import { useAuth } from '@/features/auth/context/auth-context'

export function useTemperatureUnit() {
  const { preferences } = useAuth()
  const isFahrenheit = preferences?.temperature_unit === 'fahrenheit'

  function convert(celsius: number): number {
    return isFahrenheit
      ? Math.round((celsius * 9) / 5 + 32)
      : Math.round(celsius)
  }

  return { convert, unit: isFahrenheit ? '°F' : '°C' }
}
