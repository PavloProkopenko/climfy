import { test, expect } from '@playwright/test'
import { WeatherTestId } from '../resources/enums'
import { loginTestUser, setKyivGeolocation } from '../resources/helpers'

test.describe('authentication', () => {
  test.beforeEach(async ({ page, context }) => {
    await setKyivGeolocation(page, context)
  })

  test('shows login button when anonymous', async ({ page }) => {
    await expect(page.getByTestId(WeatherTestId.AuthLoginButton)).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.AuthUserButton),
    ).not.toBeVisible()
  })

  test('can log in with valid credentials', async ({ page }) => {
    await loginTestUser(page)

    await expect(page.getByTestId(WeatherTestId.AuthUserButton)).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.AuthLoginButton),
    ).not.toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByTestId(WeatherTestId.AuthLoginButton).click()
    await page
      .getByTestId(WeatherTestId.AuthEmailInput)
      .fill('wrong@example.com')
    await page
      .getByTestId(WeatherTestId.AuthPasswordInput)
      .fill('wrongpassword')
    await page.getByTestId(WeatherTestId.AuthSubmitButton).click()

    // Error message should appear; dialog stays open
    await expect(page.getByTestId(WeatherTestId.AuthSubmitButton)).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.AuthUserButton),
    ).not.toBeVisible()
  })

  test('can log out', async ({ page }) => {
    await loginTestUser(page)

    await page.getByTestId(WeatherTestId.AuthUserButton).click()
    await page.getByTestId(WeatherTestId.AuthLogoutButton).click()

    await expect(page.getByTestId(WeatherTestId.AuthLoginButton)).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.AuthUserButton),
    ).not.toBeVisible()
  })

  test('favorites button is hidden for anonymous user', async ({ page }) => {
    const searchInput = 'Berlin'

    await page.getByTestId(WeatherTestId.SearchBar).click()
    await page.getByTestId(WeatherTestId.SearchBarInput).fill(searchInput)
    await page
      .getByTestId(WeatherTestId.SearchResultItem)
      .first()
      .waitFor({ state: 'visible' })
    await page.getByTestId(WeatherTestId.SearchResultItem).first().click()

    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })
    await expect(
      page.getByTestId(WeatherTestId.FavoriteButton),
    ).not.toBeVisible()
  })

  test('favorites button is visible after login', async ({ page }) => {
    await loginTestUser(page)

    const searchInput = 'Berlin'

    await page.getByTestId(WeatherTestId.SearchBar).click()
    await page.getByTestId(WeatherTestId.SearchBarInput).fill(searchInput)
    await page
      .getByTestId(WeatherTestId.SearchResultItem)
      .first()
      .waitFor({ state: 'visible' })
    await page.getByTestId(WeatherTestId.SearchResultItem).first().click()

    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })
    await expect(page.getByTestId(WeatherTestId.FavoriteButton)).toBeVisible()
  })
})
