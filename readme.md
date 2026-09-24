# Niro_OS

A web-based desktop and terminal simulator built with HTML, CSS, JavaScript, and PHP.

Niro_OS recreates an operating system-style environment directly in the browser, with an interactive terminal, windowed applications, live widgets, and backend services connecting to external APIs.

🔗 **Live Demo:** https://niroos.nirojgautam.com.np

---

## Why I Built This

I wanted to challenge myself to build something that feels like a small operating system while working with the browser's core technologies.

Instead of using a front-end framework, I built the interface with vanilla JavaScript to get a better understanding of DOM manipulation, event handling, window management, and asynchronous API requests.

On the backend, I wanted to practice handling server-side requests, working with third-party APIs using cURL, and keeping API credentials away from the client side.

---

## Features

### Terminal Emulator

A custom command-line interface with commands including:

* `whoami`
* `uptime`
* `neofetch`
* `calc`

The terminal also includes an AI chat fallback for commands that are not handled locally.

### Window Management

* Draggable application windows
* Window stacking and focus management
* Responsive desktop layout
* Minimize, maximize, and close controls

### Embedded Apps

**NiroCode**
In-browser HTML, CSS, and JavaScript editor with live preview.

**WikiSearch**
Wikipedia search utility using the Wikipedia API.

**Universal Converter**
Currency and unit conversion using live exchange data.

**Video Room**
Quick video conference launcher powered by Jitsi Meet.

**NiroVision**
Image generation tool using public AI endpoints.

### Live Widgets

* System monitor
* Local weather using Open-Meteo and GeoJS
* Cryptocurrency prices using CoinGecko

### Backend APIs

`bridge.php` and `chat_api.php` handle server-side requests to external LLM providers without exposing API keys to the browser.

`heartbeat.php` uses the database to track active sessions.

---

## Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Backend:** PHP 8
* **Database:** MySQL
* **APIs:** Open-Meteo, GeoJS, CoinGecko, Wikipedia REST API, Groq API, Jitsi Meet

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/NirojG/niro-os.git
cd niro-os
```

### 2. Configure the backend

Set up a PHP-compatible web server and configure the required database credentials and API keys.

Make sure sensitive credentials are stored on the server side and are not exposed in frontend JavaScript.

### 3. Run the project

Place the project in your PHP server's web directory and open it through your local development server.

For example:

```text
http://localhost/niro-os
```

---

## Project Structure

```text
niro-os/
├── index.html
├── css/
├── js/
├── apps/
├── api/
├── bridge.php
├── chat_api.php
├── heartbeat.php
└── README.md
```

> The exact structure may vary depending on the current version of the project.

---

## Author

**Niroj Gautam**

Business Information Technology student focused on cloud infrastructure, software development, and AI-driven applications.

🔗 **Portfolio:** https://nirojgautam.com.np
