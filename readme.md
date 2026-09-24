\# Niro\_OS



A web-based desktop and terminal (Operating System) simulator built using HTML, CSS, JavaScript, and PHP. 



The project includes an interactive terminal, windowed mini-apps, live weather/market widgets, and a backend chat system with both peer-to-peer and AI API integrations.



🔗 \*\*Live Link:\*\* \[niroos.nirojgautam.com.np](https://niroos.nirojgautam.com.np)



\---



\## Why I Built This



I wanted to challenge myself to build a functional, operating-system-like UI directly in the browser while practicing full-stack web development. Instead of using heavy front-end frameworks, I built this with vanilla JavaScript to better understand core DOM manipulation, event loops, and asynchronous API handling.



On the backend, I wanted hands-on practice handling server requests, communicating with third-party APIs via cURL, and securing database credentials.



\---



\## Features



\- \*\*Terminal Emulator:\*\* Custom command-line interface supporting native system commands (`whoami`, `uptime`, `neofetch`, `calc`) as well as an AI chat fallback.

\- \*\*Window Management:\*\* Draggable, stackable, and responsive desktop windows for different apps.

\- \*\*Embedded Apps:\*\*

&#x20; - \*\*NiroCode:\*\* In-browser live HTML/CSS/JS code preview.

&#x20; - \*\*WikiSearch:\*\* Wikipedia API lookup utility.

&#x20; - \*\*Universal Converter:\*\* Live currency and unit exchange calculator.

&#x20; - \*\*Video Room:\*\* Quick video conference launcher powered by Jitsi Meet.

&#x20; - \*\*NiroVision:\*\* Image generation tool using public AI endpoints.

\- \*\*Live Widgets:\*\* Real-time system monitor, local weather (via Open-Meteo \& GeoJS), and crypto price tracking (via CoinGecko).

\- \*\*Backend APIs:\*\*

&#x20; - `bridge.php` \& `chat\_api.php`: Handles server-side API requests to external LLM providers without exposing keys to the browser.

&#x20; - `heartbeat.php`: Database-backed active session counter.



\---



\## Tech Stack



\- \*\*Frontend:\*\* HTML5, CSS3, Vanilla JavaScript (ES6+)

\- \*\*Backend:\*\* PHP 8

\- \*\*Database:\*\* MySQL

\- \*\*APIs Used:\*\* Open-Meteo, CoinGecko, Wikipedia REST API, Groq API, Jitsi Meet API



\---



\## Local Setup



1\. \*\*Clone the repository:\*\*

&#x20;  ```bash

&#x20;  git clone \[https://github.com/NirojG/niro-os.git](https://github.com/NirojG/niro-os.git)

&#x20;  cd niro-os

