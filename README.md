# ScrapeFlow

**ScrapeFlow** is a modern, extensible workflow automation platform designed for browser-based web scraping, data extraction, and automation tasks. Built with **Next.js**, **Prisma**, and **Puppeteer**, it empowers users to visually design, schedule, and execute complex scraping workflows without writing code.

## Key Features

- **Visual Workflow Editor**: Build scraping workflows with a drag-and-drop interface using modular tasks (nodes) like launching browsers, navigating URLs, extracting data, filling forms, clicking elements, and more.
- **Task Library**: Includes built-in tasks for:
  - Browser automation (via Puppeteer)
  - HTML extraction
  - AI-powered data extraction
  - JSON manipulation
  - Webhook delivery
- **Execution & Monitoring**: Run workflows manually or on a schedule (cron), track execution status, view logs, and analyze results.
- **Usage-Based Credits**: Workflow executions consume credits based on tasks used. Purchase credit packs and monitor usage/billing history.
- **Authentication & Security**: Secure user authentication via **Clerk**, with sensitive data (e.g., credentials) securely stored.
- **Billing Integration**: Seamless credit purchasing and billing management with **Stripe**.
- **Extensible**: Easily add new task types or extend existing ones.

## Example Use Cases

- Automated web data extraction and reporting
- Scheduled scraping of competitor prices or product listings
- Automated form submissions and browser interactions
- AI-powered data parsing from web pages

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, Prisma ORM, SQLite
- **Automation**: Puppeteer for browser automation
- **Payments**: Stripe
- **Authentication**: Clerk
