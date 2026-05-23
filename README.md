# Dispatch Automation Tests

This repository contains automated tests for the Admin Dashboard and Courier applications using Playwright.

## Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- A `.env` file in the root directory with the variables in `sample.env`.

## Installation

Install the project dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

## Generating Test Results for the Report

### Run with HTML Reporter

To run the tests and generate the HTML page with the results:

```bash
npx playwright test path_to_test.spec.ts --reporter=html
```

### Viewing the Report

Run the following command to open the last generated HTML results, use this for the report.

```bash
npx playwright show-report
```

## Running Tests

### Run a specific test file

```bash
npx playwright test admin-dashboard/login.spec.ts
```

### Run in UI Mode (Interactive)

```bash
npx playwright test --ui
```

## Project Structure

- `admin-dashboard/`: Contains test specifications for the admin panel.
- `helpers/`: Contains reusable helper functions.
- `playwright.config.ts`: Playwright configuration file.
- `.env`: Environment variables (not committed).
