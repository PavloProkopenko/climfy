<div align="center">
<h1>CLIMFY</h1>
<p><em>Weather at your fingertips — fast, convenient, modern</em></p>

<img alt="last-commit" src="https://img.shields.io/github/last-commit/PavloProkopenko/climfy?style=flat&logo=git&logoColor=white&color=0080ff" />
<img alt="repo-top-language" src="https://img.shields.io/github/languages/top/PavloProkopenko/climfy?style=flat&color=0080ff" />
<img alt="repo-language-count" src="https://img.shields.io/github/languages/count/PavloProkopenko/climfy?style=flat&color=0080ff" />
<p><em>Built with the tools and technologies:</em></p>
<img alt="React" src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" />
<img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4.svg?style=flat&logo=TailwindCSS&logoColor=white" />
<img alt="React Query" src="https://img.shields.io/badge/React%20Query-FF4154.svg?style=flat&logo=ReactQuery&logoColor=white" />
<img alt="Playwright" src="https://img.shields.io/badge/Playwright-2D3748.svg?style=flat&logo=Playwright&logoColor=white" />
<img alt="i18n" src="https://img.shields.io/badge/i18n-007ACC.svg?style=flat&logo=i18next&logoColor=white" />
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" />
<img alt="OpenWeatherMap" src="https://img.shields.io/badge/OpenWeatherMap-FF9800.svg?style=flat&logo=OpenWeatherMap&logoColor=white" />
</div>
<br />
<hr />

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
- [Features](#features)
- [Project Structure](#project-structure)
- [License](#license)

<hr />

## Overview

**Climfy** is a modern weather application that allows you to quickly get up-to-date weather information for your city or any location in the world. It supports geolocation, city search, favorites, multilingual interface, and responsive design.

### Why Climfy?

- ⚡ **Instant weather access** — thanks to geolocation and fast search
- 🌍 **Support for many cities and countries**
- ⭐ **Favorites** — save your favorite locations
- 🌓 **Modern UI** — dark/light theme, responsive
- 🌐 **Multilingual** — easily switch the interface language
- 🧪 **E2E testing** — quality assurance with Playwright

<hr />

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/PavloProkopenko/climfy
   cd climfy
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Create a `.env` file based on `.env.example` and add your OpenWeatherMap API key.

### Usage

- **Run in development mode:**
  ```sh
  npm run dev
  # or
  yarn dev
  ```
- Open [http://localhost:3000](http://localhost:3000)

### Testing

- **E2E tests (Playwright):**
  ```sh
  npx playwright test
  ```
- **Linting:**
  ```sh
  npm run lint
  ```

<hr />

## Features

- City search with autocomplete
- Display of current weather and forecast
- Favorite cities selection
- Search history saving
- User geolocation
- Dark/light theme
- Multilingual (i18n)
- Responsive design
- E2E testing (Playwright)

<hr />

## Project Structure

```
climfy/
  ├─ public/
  ├─ src/
  │   ├─ api/
  │   ├─ components/
  │   ├─ features/
  │   ├─ pages/
  │   ├─ shared/
  │   └─ ...
  ├─ tests/
  ├─ package.json
  ├─ vite.config.ts
  └─ ...
```

<hr />

## License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="left"><a href="#top">⬆ Return</a></div>
