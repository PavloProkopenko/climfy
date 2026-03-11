import { test, expect } from '@playwright/test'
import { WeatherTestId } from '../resources/enums'
import { loginTestUser, setKyivGeolocation } from '../resources/helpers'

test.describe('weather app — anonymous', () => {
  test.beforeEach(async ({ page, context }) => {
    await setKyivGeolocation(page, context)
  })

  test('page has all weather containers', async ({ page }) => {
    await expect(
      page.getByTestId(WeatherTestId.CurrentWeatherContainer),
    ).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.HourlyTemperatureContainer),
    ).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.WeatherDetailsContainer),
    ).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.WearherForecastContainer),
    ).toBeVisible()
  })

  test('can search for a city', async ({ page }) => {
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
    await expect(page.getByTestId(WeatherTestId.FindedLocation)).toContainText(
      searchInput,
    )
  })

  test('recommendation card shows login prompt for anonymous user', async ({
    page,
  }) => {
    await expect(
      page.getByTestId(WeatherTestId.RecommendationCard),
    ).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.RecommendationLoginPrompt),
    ).toBeVisible()
  })
})

test.describe('weather app — authenticated', () => {
  test.beforeEach(async ({ page, context }) => {
    await setKyivGeolocation(page, context)
    await loginTestUser(page)
  })

  test('recommendation card does not show login prompt when logged in', async ({
    page,
  }) => {
    await expect(
      page.getByTestId(WeatherTestId.RecommendationCard),
    ).toBeVisible()
    await expect(
      page.getByTestId(WeatherTestId.RecommendationLoginPrompt),
    ).not.toBeVisible()
  })

  test('can add a city to favorites', async ({ page }) => {
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

    await page.getByTestId(WeatherTestId.FavoriteButton).click()
    await page.waitForTimeout(300)

    const bgColor = await page
      .getByTestId(WeatherTestId.FavoriteButton)
      .evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBe('oklch(0.681 0.162 75.834)')

    await page.getByTestId(WeatherTestId.HomeButton).click()
    await page
      .getByTestId(WeatherTestId.CurrentWeatherContainer)
      .waitFor({ state: 'visible' })
    await expect(page.getByTestId(WeatherTestId.FavoritesHeading)).toBeVisible()
  })
})
