import { test, expect } from '@playwright/test'
import { WeatherTestId } from '../resources/enums'

test.describe('weather app tests', () => {
  test.beforeEach(async ({ page, context }) => {
    page.goto('/')
    await context.grantPermissions(['geolocation'], {
      origin: 'http://localhost:3000',
    })
    await context.setGeolocation({ latitude: 50.4501, longitude: 30.5234 })
    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })
  })

  test('page has all containers', async ({ page }) => {
    expect(
      page.getByTestId(WeatherTestId.CurrentWeatherContainer),
    ).toBeVisible()
    expect(
      page.getByTestId(WeatherTestId.HourlyTemperatureContainer),
    ).toBeVisible()
    expect(
      page.getByTestId(WeatherTestId.WeatherDetailsContainer),
    ).toBeVisible()
    expect(
      page.getByTestId(WeatherTestId.WearherForecastContainer),
    ).toBeVisible()
  })

  test('can search city', async ({ page }) => {
    const searchInput = 'Berlin'

    await page.getByTestId(WeatherTestId.SearchBar).click()
    await page.getByTestId(WeatherTestId.SearchBarInput).click()
    await page.getByTestId(WeatherTestId.SearchBarInput).fill(searchInput)
    await page
      .getByTestId(WeatherTestId.SearchBarResultList)
      .waitFor({ state: 'visible' })
    await page.getByTestId(WeatherTestId.SearchBarResultList).first().click()

    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })

    expect(page.getByTestId(WeatherTestId.FindedLocation)).toContainText(
      searchInput,
    )
  })

  test('add to favorite', async ({ page }) => {
    // We need to search before add to favorite
    const searchInput = 'Berlin'

    await page.getByTestId(WeatherTestId.SearchBar).click()
    await page.getByTestId(WeatherTestId.SearchBarInput).click()
    await page.getByTestId(WeatherTestId.SearchBarInput).fill(searchInput)
    await page
      .getByTestId(WeatherTestId.SearchBarResultList)
      .waitFor({ state: 'visible' })
    await page.getByTestId(WeatherTestId.SearchBarResultList).first().click()

    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })

    // Favorite
    await page.getByTestId(WeatherTestId.FavoriteButton).click()
    await page.waitForTimeout(200)
    const favoriteButtonBgColor = await page
      .getByTestId(WeatherTestId.FavoriteButton)
      .evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(favoriteButtonBgColor).toBe('oklch(0.681 0.162 75.834)')

    await page.getByTestId(WeatherTestId.HomeButton).click()
    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })

    expect(page.getByTestId(WeatherTestId.FavoritesHeading)).toBeVisible()
  })
})
