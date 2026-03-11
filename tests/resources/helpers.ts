import type { Page } from '@playwright/test'
import { WeatherTestId } from './enums'

/**
 * Log in with the test user credentials from the environment.
 * Requires PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD in .env.
 * The test user must already exist in Supabase with onboarding_completed = true.
 */
export async function loginTestUser(page: Page) {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL!
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD!

  await page.getByTestId(WeatherTestId.AuthLoginButton).click()
  await page.getByTestId(WeatherTestId.AuthEmailInput).fill(email)
  await page.getByTestId(WeatherTestId.AuthPasswordInput).fill(password)
  await page.getByTestId(WeatherTestId.AuthSubmitButton).click()

  // Wait for the user button to appear (auth completed)
  await page
    .getByTestId(WeatherTestId.AuthUserButton)
    .waitFor({ state: 'visible' })
}

export async function setKyivGeolocation(
  page: Page,
  context: import('@playwright/test').BrowserContext,
) {
  await context.grantPermissions(['geolocation'], {
    origin: 'http://localhost:3000',
  })
  await context.setGeolocation({ latitude: 50.4501, longitude: 30.5234 })
  await page.goto('/')
  await page
    .getByTestId(WeatherTestId.CurrentWeatherContainer)
    .waitFor({ state: 'visible' })
}
