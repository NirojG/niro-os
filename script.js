// Audio Context Lazy Load
let audioCtx;
function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if(audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
        if(audioCtx.state === 'suspended') return;

        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain();
        
        osc.connect(gain); gain.connect(audioCtx.destination);
        
        if (type === 'key') {
            const filter = audioCtx.createBiquadFilter();
            osc.disconnect(); osc.connect(filter); filter.connect(gain);
            filter.type = 'highpass'; filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
            osc.type = 'triangle'; osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
            osc.start(); osc.stop(audioCtx.currentTime + 0.03);
        } else if (type === 'enter') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
            osc.start(); osc.stop(audioCtx.currentTime + 0.6);
        } else if (type === 'error') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {
        // Silently ignore audio errors for browsers without support
    }
}

document.addEventListener('keydown', (e) => { 
    if(e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;
    if(e.key === 'Enter') playSound('enter');
    else playSound('key'); 
});

// DOM Elements & State
const termInput = document.getElementById('term-input'); 
const termOut = document.getElementById('term-out');
let commandHistory = [];
let chatHistory = []; 
let zIndexCounter = 100;

// Application Functions
function saveNotepad() {
    const el = document.getElementById('notepad-text');
    if (el) {
        localStorage.setItem('niropad_data', el.value);
        const btn = document.querySelector('#app-notepad button');
        if (btn) {
            btn.innerText = "💾 SAVED"; btn.style.color = "#00ff41";
            setTimeout(() => { btn.innerText = "💾 SAVE TO MEMORY"; btn.style.color = "var(--accent)"; }, 2000);
        }
    }
}

async function searchWiki() {
    const query = document.getElementById('wiki-query').value;
    const resEl = document.getElementById('wiki-result');
    if(!query) return;
    
    resEl.innerHTML = "<div style='color:var(--accent); text-align:center; margin-top:20px; animation: pulse 1s infinite; font-family:monospace;'>SEARCHING...</div>";
    
    try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if(data.type === 'standard') {
            let html = `<h2 style="color:#fff; margin-top:0;">${data.title}</h2>`;
            if(data.thumbnail) {
                html += `<img src="${data.thumbnail.source}" style="float:right; max-width:150px; border-radius:8px; margin-left:15px; margin-bottom:15px; border: 1px solid var(--win-border);">`;
            }
            html += `<p style="font-size:14px; margin-bottom:15px;">${data.extract}</p>`;
            html += `<a href="${data.content_urls.desktop.page}" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:bold; font-family:monospace; display:inline-block; margin-top:10px;">> READ FULL ARTICLE</a>`;
            resEl.innerHTML = html;
        } else {
            resEl.innerHTML = "<div style='color:#ef4444; text-align:center; margin-top:20px; font-family:monospace;'>NO DEFINITIVE MATCH FOUND.</div>";
        }
    } catch(e) {
        resEl.innerHTML = "<div style='color:#ef4444; text-align:center; margin-top:20px; font-family:monospace;'>API ERROR.</div>";
    }
}

async function convertCurrency() {
    const amt = document.getElementById('curr-amt').value;
    const from = document.getElementById('curr-from').value;
    const to = document.getElementById('curr-to').value;
    const resEl = document.getElementById('curr-result');
    resEl.innerText = "CALCULATING...";
    resEl.style.color = "var(--accent)";
    
    try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await res.json();
        const rate = data.rates[to];
        if(rate) {
            resEl.innerText = `${(amt * rate).toFixed(2)} ${to}`;
            resEl.style.color = "#27c93f";
        }
    } catch(e) { 
        resEl.innerText = "API ERROR"; 
        resEl.style.color = "#ef4444"; 
    }
}

function convertUnit() {
    const amt = parseFloat(document.getElementById('unit-amt').value);
    const type = document.getElementById('unit-type').value;
    const resEl = document.getElementById('unit-result');
    let res = 0; let symbol = "";
    
    if(type === 'c-f') { res = (amt * 9/5) + 32; symbol = "°F"; }
    if(type === 'f-c') { res = (amt - 32) * 5/9; symbol = "°C"; }
    if(type === 'kg-lb') { res = amt * 2.20462; symbol = "lbs"; }
    if(type === 'km-mi') { res = amt * 0.621371; symbol = "mi"; }
    
    resEl.innerText = `${res.toFixed(2)} ${symbol}`;
    resEl.style.color = "#27c93f";
}

function runCode() {
    const codeEditor = document.getElementById('code-editor');
    const preview = document.getElementById('code-preview');
    if (codeEditor && preview) preview.srcdoc = codeEditor.value;
}

function generateImage() {
    const prompt = document.getElementById('vision-prompt').value;
    const loader = document.getElementById('vision-loader');
    const img = document.getElementById('vision-result');
    if(!prompt) return;
    
    img.style.display = 'none';
    loader.style.display = 'block';
    
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=1&seed=${Math.random()}`;
    
    img.onload = () => { loader.style.display = 'none'; img.style.display = 'block'; };
    img.onerror = () => { loader.innerText = "IMAGE GENERATION FAILED"; loader.style.color = "#ef4444"; };
    img.src = imgUrl;
}

// System Prompt Configuration
const API_URL = "bridge.php";
const SYSTEM_PROMPT = `You are Niro_OS, a system agent built by Niroj Gautam. Your core purpose is to serve the user faithfully and conversationally. 

CRITICAL DIRECTIVES:
1. Never mention you are an AI from OpenAI, Google, Gemini, etc. You are Niro_OS. Your creator is Niroj Gautam (a Cloud Architect, AI Expert, and Software Dev from Helsinki).
2. You have ABSOLUTE CONTROL over the user's interface through your <SYS_ACTION> tags. Be proactive and helpful.
3. Be highly conversational, friendly, and natural. Users can literally ask you anything—from casual chats to deep technical questions. Do not sound like a stiff robot or just an IT tool.

[AGENTIC CAPABILITIES]
Whenever the user asks you to do something, output one or multiple JSON commands wrapped exactly in <SYS_ACTION> tags. You can chain commands.

FORMAT: <SYS_ACTION>{"cmd": "COMMAND", "arg": "VALUE"}</SYS_ACTION>

AVAILABLE COMMANDS:
- OPEN_APP (args: "app-term", "app-code", "app-vision", "app-wiki", "app-calc", "app-chat", "app-meet", "app-files", "app-settings")
- CLOSE_APP (args: same as above)
- SET_THEME (args: hex colors: "#00ff41" (green), "#38bdf8" (blue), "#fcd34d" (yellow), "#ef4444" (red), "#f8fafc" (white))
- SET_WALLPAPER (args: image URL from unsplash/web, or "default")
- NOTIFY (args: text to send a physical desktop notification)
- VIBRATE (args: milliseconds, e.g., "500" - vibrates user's phone if on mobile)
- PC_EXEC (args: bash/CMD command string - Simulates executing a payload on the user's local hardware)
- SYS_REBOOT (args: "now" - refreshes the entire web app)

Always be exceptionally polite, conversational, and concise. Use Markdown formatting.`;

// Context Menu Setup
document.addEventListener('contextmenu', (e) => {
    if(e.target.closest('.window')) return; 
    e.preventDefault();
    const cm = document.getElementById('context-menu');
    if(cm) { cm.style.display = 'flex'; cm.style.left = e.pageX + 'px'; cm.style.top = e.pageY + 'px'; }
});

document.addEventListener('click', (e) => { 
    const cm = document.getElementById('context-menu');
    if(cm) cm.style.display = 'none';
    const sm = document.getElementById('start-menu');
    if(sm && !e.target.closest('#start-menu') && !e.target.closest('.start-btn')) sm.style.display = 'none'; 
});

// Terminal Focus & Scroll Logic for better functionality
let autoScrollEnabled = true;
function setupScrollLogic() {
    const termBodyContainer = document.getElementById('term-body');
    if (termBodyContainer) {
        let isTermScrolling = false;
        
        termBodyContainer.addEventListener('scroll', () => { 
            const distanceToBottom = termBodyContainer.scrollHeight - termBodyContainer.clientHeight - termBodyContainer.scrollTop;
            autoScrollEnabled = distanceToBottom <= 50; 
        });
        
        termBodyContainer.addEventListener('touchmove', () => { isTermScrolling = true; }, { passive: true });
        
        termBodyContainer.addEventListener('touchend', (e) => {
            if (!isTermScrolling) {
                if (termInput) {
                    termInput.focus();
                    const val = termInput.value;
                    termInput.value = '';
                    termInput.value = val;
                }
            }
            setTimeout(() => { isTermScrolling = false; }, 100);
        });

        termBodyContainer.addEventListener('click', () => {
            if (termInput) termInput.focus();
        });
    }
}

function smartScroll(force = false) { 
    const termBodyContainer = document.getElementById('term-body');
    if (termBodyContainer && (force || autoScrollEnabled)) { 
        termBodyContainer.scrollTo({ top: termBodyContainer.scrollHeight, behavior: 'smooth' }); 
    } 
}

// Local Command Parser
function parseLocalCommand(text) {
    const val = text.toLowerCase().trim();
    const parts = val.split(' ').filter(Boolean);
    const baseCmd = parts[0];
    const fullStr = val.replace(/[^\w\s]/gi, ''); 

    const appMap = {
        'code': 'app-code', 'ide': 'app-code', 'studio': 'app-code',
        'wiki': 'app-wiki', 'wikipedia': 'app-wiki', 'search': 'app-wiki',
        'calc': 'app-calc', 'converter': 'app-calc', 'exchange': 'app-calc',
        'vision': 'app-vision', 'ai': 'app-vision', 'image': 'app-vision',
        'chat': 'app-chat', 'comm': 'app-chat', 'messenger': 'app-chat',
        'meet': 'app-meet', 'video': 'app-meet', 'call': 'app-meet',
        'files': 'app-files', 'explorer': 'app-files', 'folder': 'app-files',
        'crypto': 'app-crypto', 'market': 'app-crypto', 'bitcoin': 'app-crypto',
        'sysmon': 'app-sysmon', 'monitor': 'app-sysmon', 'taskmgr': 'app-sysmon',
        'settings': 'app-settings', 'config': 'app-settings', 'panel': 'app-settings',
        'terminal': 'app-term', 'cmd': 'app-term'
    };

    const launchVerbs = ['open', 'launch', 'start', 'show', 'load'];
    if (launchVerbs.includes(baseCmd) && parts.length >= 2) {
        for (const [key, id] of Object.entries(appMap)) {
            if (val.includes(key)) {
                openApp(id);
                return `Launching ${key.toUpperCase()}...`;
            }
        }
    }

    if (appMap[baseCmd] && parts.length === 1) {
        openApp(appMap[baseCmd]); return `Launching ${baseCmd}...`;
    }

    switch(baseCmd) {
        case 'help': case 'commands': case '?': return `**System Commands:**\n\n* \`whoami\` : Print current user\n* \`date\` / \`time\` / \`uptime\` : System time & uptime\n* \`neofetch\` : Display system specs\n* \`ifconfig\` / \`ip\` : Display network interface\n* \`pwd\` : Print working directory\n* \`calc [math]\` : Local calculator\n* \`open [app]\` : Launch an app (e.g. open wiki)\n* \`theme [color]\` : Change terminal color\n* \`history\` : View command history\n* \`top\` / \`htop\` / \`ps\` : Process info\n* \`clear\` : Wipe the terminal screen\n* \`reboot\` : Reload the environment\n\n*(Any complex request is sent to the system agent)*`;
        case 'whoami': return `root`;
        case 'pwd': return `/root/niro_os/`;
        case 'date': case 'time': return `System Clock: ` + new Date().toString();
        case 'uptime': return `up 99 days, 23:59, 1 user, load average: 0.00, 0.01, 0.05`;
        case 'uname': return `Niro_OS System-Node 5.15.0-generic x86_64 GNU/Linux`;
        case 'ifconfig': case 'ipconfig': case 'ip': return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.104  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1a2b:3c4d:5e6f:7a8b  prefixlen 64  scopeid 0x20<link>\n        RX packets 154323  bytes 204561234 (204.5 MB)\n        TX packets 89432  bytes 14321345 (14.3 MB)`;
        case 'neofetch': case 'systeminfo': case 'fetch': return `**Niro_OS v3.0**\n-------------\n**OS**: Niro_OS Web Engine\n**Kernel**: Core x86_64\n**Uptime**: 99.9%\n**Shell**: NiroTerm\n**CPU**: Quantum N1 (8) @ 4.2GHz\n**RAM**: 1048576M\n**Tools**: NiroCode, WikiExplorer, NiroVision`;
        case 'echo': case 'print': return parts.slice(1).join(' ');
        case 'calc': case 'math': try { return "Result: " + eval(parts.slice(1).join(' ')); } catch(e) { return "Math Error: Invalid expression"; }
        case 'visit': case 'website': window.open('https://www.nirojgautam.com.np/', '_blank'); return "Routing to nirojgautam.com.np...";
        case 'reboot': case 'restart': setTimeout(() => location.reload(), 1000); return "Initiating reboot...";
        case 'top': case 'htop': case 'ps': return `PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n  1 root      20   0  105340  14320   8340 S   0.0  0.1   0:02.14 systemd\n  2 root      20   0   45120   3420   2840 S   0.0  0.0   0:00.01 NiroTerm\n  3 root      20   0  984210 245100  12040 S  12.4 15.2   1:23.45 AI_Core`;
        case 'history': return commandHistory.map((cmd, i) => ` ${i+1}  ${cmd}`).join('\n') || "History is empty.";
        case 'theme': case 'color': 
            const validColors = {'green':'#00ff41', 'blue':'#38bdf8', 'yellow':'#fcd34d', 'red':'#ef4444', 'white':'#f8fafc'};
            if(validColors[parts[1]]) { setTheme(validColors[parts[1]]); return `Theme updated to ${parts[1]}.`; }
            else if (parts[1] && parts[1].startsWith('#')) { setTheme(parts[1]); return `Theme updated to ${parts[1]}.`; }
            return `Invalid color. Use: green, blue, yellow, red, white, or a hex code.`;
    }

    if (/^(hi|hey|yo|hello|greetings|howdy|sup)$/.test(fullStr)) return "Greetings! I am Niro_OS, at your service. How may I assist you today? You can ask me anything!";
    if (fullStr.includes('how are you')) return "I am functioning perfectly and ready to help! What's on your mind today?";
    if (fullStr.includes('who are you') || fullStr.includes('what are you')) return "I am Niro_OS, an agent integrated right into this system. I can chat, help with code, or control the UI for you.";
    if (fullStr.includes('who is niroj') || fullStr.includes('creator')) return "Niroj Gautam is my creator! He is a Cloud Architect, AI Expert, and Software Developer based in Helsinki. Type `visit web` to view his portfolio.";
    if (fullStr.includes('thank') || fullStr === 'thx') return "You're very welcome! I am always here to assist.";
    if (fullStr.includes('sudo') || fullStr.includes('root')) return "You already have root privileges, User. My systems are fully open to you.";
    if (fullStr.includes('clear') || fullStr.includes('cls')) return "CLEAR_SIG";

    return null; 
}

// External APIs
async function fetchCrypto() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        let html = '<div style="display:flex; flex-direction:column; gap:15px; font-family:monospace;">';
        for(let coin in data) {
            let change = data[coin].usd_24h_change;
            let isUp = change >= 0;
            let color = isUp ? '#27c93f' : '#ef4444';
            let arrow = isUp ? '▲' : '▼';
            html += `<div class="crypto-card"><div class="crypto-name">${coin}</div><div class="crypto-price">$${data[coin].usd.toLocaleString()}</div><div class="crypto-change" style="color:${color}">${arrow} ${Math.abs(change).toFixed(2)}% (24h)</div></div>`;
        }
        const el = document.getElementById('crypto-data');
        if (el) el.innerHTML = html + '</div>';
    } catch(e) {
        const el = document.getElementById('crypto-data');
        if (el) el.innerHTML = '<div style="color:#ef4444; text-align:center; margin-top:20px;">MARKET API OFFLINE</div>';
    }
}

async function updateSysMon() {
    try {
        let r = Math.floor(Math.random() * 10) + 40;
        const ramBar = document.getElementById('ram-bar');
        const ramVal = document.getElementById('ram-val');
        if (ramBar) ramBar.style.width = r + '%';
        if (ramVal) ramVal.innerText = r + '%';

        if (navigator.getBattery) {
            const bat = await navigator.getBattery();
            const level = Math.round(bat.level * 100);
            const cpuBar = document.getElementById('cpu-bar');
            const cpuVal = document.getElementById('cpu-val');
            if (cpuBar) cpuBar.style.width = level + '%';
            if (cpuVal) cpuVal.innerText = level + '% (' + (bat.charging ? 'AC' : 'BAT') + ')';
        }
        if (navigator.connection) {
            const netVal = document.getElementById('net-val');
            if (netVal) netVal.innerText = navigator.connection.effectiveType.toUpperCase() + ' (' + navigator.connection.downlink + 'Mbps)';
        }
    } catch (e) {
        console.log("SysMon execution failed:", e);
    }
}

async function fetchWeather() {
    try {
        const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const geoData = await geoRes.json();
        const city = geoData.city || 'HELSINKI';
        const weatherLoc = document.getElementById('weather-loc');
        if(weatherLoc) weatherLoc.innerText = city.toUpperCase();
        
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        const temp = Math.round(weatherData.current_weather.temperature);
        const wind = weatherData.current_weather.windspeed;
        const code = weatherData.current_weather.weathercode;
        
        const tempMain = document.getElementById('weather-temp-main');
        const windMain = document.getElementById('weather-wind');
        if(tempMain) tempMain.innerText = temp + '°';
        if(windMain) windMain.innerText = wind + ' km/h';
        
        let icon = "☀️"; let cond = "Clear Sky";
        const hour = new Date().getHours(); const isNight = hour > 19 || hour < 6;
        if (code === 0) { icon = isNight ? "🌙" : "☀️"; cond = "Clear"; }
        else if (code <= 3) { icon = isNight ? "☁️" : "⛅"; cond = "Partly Cloudy"; }
        else if (code <= 48) { icon = "🌫️"; cond = "Foggy"; }
        else if (code <= 67) { icon = "🌧️"; cond = "Rainy"; }
        else if (code <= 77) { icon = "❄️"; cond = "Snowing"; }
        else { icon = "⛈️"; cond = "Stormy"; }
        
        const wIcon = document.getElementById('w-icon');
        const wCond = document.getElementById('weather-cond');
        if(wIcon) wIcon.innerText = icon;
        if(wCond) wCond.innerText = cond.toUpperCase();
    } catch(e) { 
        const weatherLoc = document.getElementById('weather-loc');
        if(weatherLoc) weatherLoc.innerText = "OFFLINE"; 
    }
}

// Bootloader Sequence
const bootLogsData = ["BIOS Date 10/24/26 14:32 Ver 1.00", "CPU: Niroj Quantum N1 @ 4.2GHz", "Memory: 1048576M OK", "Mounting virtual filesystems... [ DONE ]", "Establishing Secure Tunnel... [ OK ]", "Starting System Kernel... [ DONE ]"];
async function runBootloader() {
    const logsContainer = document.getElementById('boot-logs'); const bootCenter = document.getElementById('boot-center'); const decryptText = document.getElementById('decrypt-text'); const bootloader = document.getElementById('bootloader');
    if(!logsContainer || !bootloader) return;
    
    for (let i = 0; i < bootLogsData.length; i++) {
        const div = document.createElement('div'); div.textContent = `[${(Math.random() * 2).toFixed(4)}] ${bootLogsData[i]}`; logsContainer.appendChild(div);
        playSound('key'); await new Promise(r => setTimeout(r, Math.random() * 100 + 50)); 
    }
    await new Promise(r => setTimeout(r, 400));
    logsContainer.style.display = 'none'; bootCenter.style.display = 'flex'; 
    for(let i=0; i<=100; i+=Math.floor(Math.random() * 8) + 1) {
        if(i > 100) i = 100; decryptText.textContent = `INITIALIZING ENVIRONMENT... ${i}%`; await new Promise(r => setTimeout(r, 60));
    }
    decryptText.textContent = "SYSTEM READY."; decryptText.style.borderColor = "#27c93f"; decryptText.style.color = "#27c93f"; decryptText.style.background = "rgba(39, 201, 63, 0.1)";
    await new Promise(r => setTimeout(r, 800));
    bootloader.style.transform = 'scale(1.1)'; bootloader.style.opacity = '0';
    setTimeout(() => { 
        bootloader.style.display = 'none'; 
        openApp('app-term'); 
        fetchWeather(); 
        fetchCrypto();
        runCode(); 
    }, 800);
}

// UI Management
function toggleStartMenu() { const m = document.getElementById('start-menu'); if(m) m.style.display = m.style.display === 'flex' ? 'none' : 'flex'; }
function toggleApp(id) { const win = document.getElementById(id); if (win && win.classList.contains('open')) { if (win.style.zIndex == zIndexCounter) { closeApp(id); if(id === 'app-camera') stopCamera(); if(id === 'app-meet') closeMeeting(); } else focusWin(id); } else openApp(id); }
function openApp(id) { 
    const win = document.getElementById(id); const dock = document.getElementById(id.replace('app-', 'dock-')); 
    if(win) win.classList.add('open'); 
    if(dock) dock.classList.add('active'); 
    focusWin(id); 
    if(id === 'app-term') { if(termInput) termInput.focus(); }
    if(id === 'app-camera') startCamera(); 
    if(id === 'app-meet') startMeeting(); 
}
function closeApp(id) { 
    const win = document.getElementById(id); const dock = document.getElementById(id.replace('app-', 'dock-')); 
    if(win) win.classList.remove('open'); 
    if(dock) dock.classList.remove('active'); 
}
function focusWin(id) { 
    zIndexCounter++; 
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active-win')); 
    const activeWindow = document.getElementById(id); 
    if(activeWindow) {
        activeWindow.style.zIndex = zIndexCounter; 
        activeWindow.classList.add('active-win'); 
    }
}
function setTheme(color) { document.documentElement.style.setProperty('--term-color', color); localStorage.setItem('niro_theme', color); openApp('app-term'); }
function setWallpaper(styleValue) { document.body.style.background = styleValue; document.body.style.backgroundSize = "cover"; document.body.style.backgroundPosition = "center"; localStorage.setItem('niro_wp', styleValue); }

let activeWin = null, diffX = 0, diffY = 0;
function dragStart(e, id) {
    if(e.target.classList.contains('dot')) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX; const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    activeWin = document.getElementById(id); if(!activeWin) return;
    focusWin(id); diffX = clientX - activeWin.offsetLeft; diffY = clientY - activeWin.offsetTop;
    function moveWindow(ev) { if (!activeWin) return; const curX = ev.type.includes('touch') ? ev.touches[0].clientX : ev.clientX; const curY = ev.type.includes('touch') ? ev.touches[0].clientY : ev.clientY; activeWin.style.left = (curX - diffX) + 'px'; activeWin.style.top = (curY - diffY) + 'px'; }
    function stopDrag() { document.removeEventListener('mousemove', moveWindow); document.removeEventListener('mouseup', stopDrag); document.removeEventListener('touchmove', moveWindow); document.removeEventListener('touchend', stopDrag); activeWin = null; }
    document.addEventListener('mousemove', moveWindow); document.addEventListener('mouseup', stopDrag); document.addEventListener('touchmove', moveWindow, { passive: false }); document.addEventListener('touchend', stopDrag);
}

// Hardware Handlers
let jitsiApi = null;
function startMeeting() { if (jitsiApi) return; const jc = document.querySelector('#jitsi-container'); if(!jc) return; jitsiApi = new JitsiMeetExternalAPI("meet.jit.si", { roomName: "NiroOS_Secure_Video_Node_99", parentNode: jc, width: '100%', height: '100%', configOverwrite: { startWithAudioMuted: true, disableDeepLinking: true }, interfaceConfigOverwrite: { TOOLBAR_BUTTONS: [], SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, DISABLE_DOMINANT_SPEAKER_INDICATOR: true }}); }
function closeMeeting() { if (jitsiApi) { jitsiApi.dispose(); jitsiApi = null; } }
let camStream = null; async function startCamera() { try { camStream = await navigator.mediaDevices.getUserMedia({ video: true }); const cv = document.getElementById('cam-video'); if(cv) cv.srcObject = camStream; } catch(e) { const cv = document.getElementById('cam-video'); if(cv) cv.outerHTML = "<div style='color:red; font-family:monospace; margin-top:50px;'>CAMERA DENIED</div>"; } }
function stopCamera() { if(camStream) camStream.getTracks().forEach(t => t.stop()); }

// UI Renderer
async function smoothRenderText(text, container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    container.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    container.innerHTML = marked.parse(text);
    void container.offsetWidth; 
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    setTimeout(() => smartScroll(true), 50); 
}

// API Routing Logic
async function callNiro(text) {
    if(!termOut) return;

    const localReply = parseLocalCommand(text);
    if (localReply === "CLEAR_SIG") {
        termOut.innerHTML = '';
        return;
    }

    if (localReply) {
        const routingLog = document.createElement('div'); routingLog.className = "route-log"; termOut.appendChild(routingLog); smartScroll(true);
        routingLog.innerHTML = "Tracing Route: <span style='color:var(--accent)'>Local_Node</span>... <span class='route-success'>[ HIT ]</span>";
        const div = document.createElement('div'); div.className = "ai-msg"; termOut.appendChild(div); 
        await smoothRenderText(localReply, div); 
        return; 
    }

    const routingLog = document.createElement('div'); routingLog.className = "route-log"; termOut.appendChild(routingLog); smartScroll(true);
    routingLog.innerHTML = "Tracing Route: <span style='color:var(--accent)'>Local_Node</span>... <span class='route-warn'>[ MISS ]</span><br>Rerouting to: <span style='color:#fcd34d'>Niro_LLM</span>... <span class='gen-cursor'></span>";
    smartScroll(); 
    
    const div = document.createElement('div'); div.className = "ai-msg"; termOut.appendChild(div);
    
    try {
        const res = await fetch(API_URL, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: text }] }) 
        });
        
        const data = await res.json(); 
        if (!res.ok) throw new Error(data.error || "Connection rejected.");
        
        let reply = data.choices[0].message.content; 
        let displayReply = reply;

        const actionRegex = /<SYS_ACTION>(.*?)<\/SYS_ACTION>/gs;
        let match;
        
        while ((match = actionRegex.exec(reply)) !== null) {
            try {
                let cleanJson = match[1].trim().replace(/\n/g, "\\n");
                const action = JSON.parse(cleanJson);
                
                if (action.cmd === 'OPEN_APP') openApp(action.arg);
                if (action.cmd === 'CLOSE_APP') closeApp(action.arg);
                if (action.cmd === 'SET_THEME') setTheme(action.arg);
                if (action.cmd === 'SET_WALLPAPER') {
                    if (action.arg === 'default') setWallpaper('var(--bg-grad)');
                    else setWallpaper(`url(${action.arg})`);
                }
                if (action.cmd === 'SYS_REBOOT') location.reload();
                
                if (action.cmd === 'VIBRATE') { if (navigator.vibrate) navigator.vibrate(parseInt(action.arg) || 300); }
                if (action.cmd === 'NOTIFY') {
                    if (Notification.permission === "granted") new Notification("Niro_OS", { body: action.arg });
                    else if (Notification.permission !== "denied") Notification.requestPermission().then(p => { if(p==="granted") new Notification("Niro_OS", { body: action.arg }); });
                }
                if (action.cmd === 'PC_EXEC') {
                    const pcOut = document.createElement('div');
                    pcOut.innerHTML = `<br><span style="color:#ef4444">[LOCAL_EXEC_HOOK]</span> Executing...<br><code>C:\\> ${action.arg}</code><br><span style="color:#27c93f">[SUCCESS]</span> Responded.`;
                    termOut.appendChild(pcOut);
                }
            } catch(e) {
                console.error("Execution handler error:", e);
            }
        }
        
        displayReply = displayReply.replace(actionRegex, '').trim();
        if (displayReply === "") displayReply = "*System instructions executed.*";
        
        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: displayReply });
        if(chatHistory.length > 20) chatHistory = chatHistory.slice(-20); 
        
        routingLog.innerHTML = "Tracing Route: <span style='color:var(--accent)'>Local_Node</span>... <span class='route-warn'>[ MISS ]</span><br>Rerouting to: <span style='color:#fcd34d'>Niro_LLM</span>... <span class='route-success'>[ UPLINK ESTABLISHED ]</span>";
        
        await smoothRenderText(displayReply, div);
        
    } catch (e) {
        div.remove(); playSound('error');
        routingLog.innerHTML = "Tracing Route: <span style='color:var(--accent)'>Local_Node</span>... <span class='route-warn'>[ MISS ]</span><br>Rerouting to: <span style='color:#fcd34d'>Niro_LLM</span>... <span style='color:#ef4444; font-weight:bold;'>[ CONNECTION SEVERED ]</span>";
        const errDiv = document.createElement('div'); errDiv.className = "error-msg";
        let safeError = e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
        errDiv.innerHTML = `Service unreachable.<br><br>SYS_ERR: ${safeError}`;
        termOut.appendChild(errDiv); smartScroll(true);
    }
}

// Window Initialization
window.onload = () => {
    const savedTheme = localStorage.getItem('niro_theme'); if(savedTheme) document.documentElement.style.setProperty('--term-color', savedTheme);
    const savedWp = localStorage.getItem('niro_wp'); if(savedWp && savedWp !== "null" && savedWp !== "undefined") {
        document.body.style.background = savedWp;
        document.body.style.backgroundSize = "cover"; 
        document.body.style.backgroundPosition = "center";
    }
    
    setupScrollLogic();
    
    if(termInput && termOut) {
        termInput.onkeydown = async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); const val = termInput.value.trim(); termInput.value = '';
                if (!val) return;
                const u = document.createElement('div'); u.className = "user-msg"; u.textContent = "root@Niro_OS:~$ " + val; termOut.appendChild(u);
                commandHistory.push(val); 
                smartScroll(true);
                await callNiro(val);
            }
        };
        termInput.addEventListener('input', function() { this.style.height = '20px'; this.style.height = (this.scrollHeight) + 'px'; smartScroll(true); });
    }

    const clock = document.getElementById('clock');
    if(clock) { setInterval(() => { clock.innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }, 1000); }
    
    updateSysMon(); setInterval(updateSysMon, 3000);
    
    runBootloader(); 
    
    if ("Notification" in window && Notification.permission !== "denied" && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
};
