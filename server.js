const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const net = require('net');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Setup multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads')),
    filename: (req, file, cb) => cb(null, 'bg-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- KONFIGURASI KEAMANAN ---
const ADMIN_TOKEN = "token-rahasia-localdash-123";

function getAdminPassword() {
    if (fs.existsSync(SETTINGS_FILE)) {
        try {
            const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            if (settings.password) return settings.password;
        } catch (e) {}
    }
    return "admin"; // Password default
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inisialisasi Data
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ background: '', theme: 'dark', password: 'admin' }, null, 2));
}

// Middleware Autentikasi
function requireAuth(req, res, next) {
    const token = req.headers['authorization'];
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Tidak ada akses (Unauthorized)' });
    }
}

// --- ENDPOINT AUTENTIKASI ---
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === getAdminPassword()) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ success: false, message: 'Password salah' });
    }
});

app.post('/api/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (oldPassword === getAdminPassword()) {
        let settings = { background: '', theme: 'dark' };
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        settings.password = newPassword;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Password lama salah' });
    }
});

// --- ENDPOINT SETTINGS ---
app.get('/api/settings', (req, res) => {
    fs.readFile(SETTINGS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Gagal' });
        res.json(JSON.parse(data));
    });
});

app.post('/api/settings', requireAuth, (req, res) => {
    const newSettings = req.body;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    res.json({ success: true });
});

app.post('/api/upload-bg', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file' });
    const bgUrl = `/uploads/${req.file.filename}`;
    
    // Update setting dengan file baru
    let settings = { background: '', theme: 'dark' };
    if (fs.existsSync(SETTINGS_FILE)) {
        settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
    settings.background = bgUrl;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    
    res.json({ success: true, url: bgUrl });
});

// --- ENDPOINT DATA LINKS ---
const colors = ['red', 'blue', 'green', 'yellow', 'indigo', 'purple', 'pink', 'teal', 'orange'];
function getRandomColor() { return colors[Math.floor(Math.random() * colors.length)]; }

app.get('/api/links', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // Sort based on order index if available
    data.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(data);
});

app.post('/api/links', requireAuth, (req, res) => {
    const { name, url, category, customIcon } = req.body;
    const links = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const existingCat = links.find(l => l.category.toLowerCase() === category.toLowerCase());
    let icon = customIcon || (existingCat ? existingCat.icon : 'fa-folder');
    let color = existingCat ? existingCat.color : getRandomColor();

    if (!existingCat && !customIcon) {
        if (category.toLowerCase().includes('jaringan')) { icon = 'fa-network-wired'; color = 'red'; }
        else if (category.toLowerCase().includes('media') || category.toLowerCase().includes('storage')) { icon = 'fa-hard-drive'; color = 'green'; }
        else if (category.toLowerCase().includes('dev')) { icon = 'fa-code'; color = 'indigo'; }
    }

    const newLink = {
        id: Date.now(),
        name, url, category, icon, color,
        order: links.length
    };
    
    links.push(newLink);
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
    res.json({ success: true, link: newLink });
});

app.put('/api/links/reorder', requireAuth, (req, res) => {
    const { orderData } = req.body; // Array of { id, order }
    let links = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    orderData.forEach(od => {
        const link = links.find(l => l.id === od.id);
        if(link) link.order = od.order;
    });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
    res.json({ success: true });
});

app.put('/api/links/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const { name, url, category, customIcon } = req.body;
    let links = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const link = links.find(l => l.id === id);
    if (!link) return res.status(404).json({ error: 'Not found' });

    link.name = name;
    link.url = url;
    link.category = category;
    if (customIcon) link.icon = customIcon;

    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
    res.json({ success: true });
});

app.delete('/api/links/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    let links = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    links = links.filter(l => l.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
    res.json({ success: true });
});

// --- ENDPOINT HEALTH CHECK ---
const http = require('http');
const https = require('https');

function checkHostPort(host, port, timeout = 2000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const startTime = Date.now();
        let result = { status: 'offline', ms: 0 };
        
        socket.setTimeout(timeout);
        socket.on('connect', () => { 
            result.status = 'online'; 
            result.ms = Date.now() - startTime;
            socket.destroy(); 
        });
        socket.on('timeout', () => { socket.destroy(); });
        socket.on('error', () => { socket.destroy(); });
        socket.on('close', () => { resolve(result); });
        socket.connect(port, host);
    });
}

function checkHttp(urlString, timeout = 3000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const client = urlString.startsWith('https') ? https : http;
        
        const req = client.get(urlString, {
            timeout: timeout,
            rejectUnauthorized: false
        }, (res) => {
            // Treat 200-499 as online, 500+ as offline (especially 502/521/522 for reverse proxies)
            if (res.statusCode >= 200 && res.statusCode < 500) {
                resolve({ status: 'online', ms: Date.now() - startTime });
            } else {
                resolve({ status: 'offline', ms: 0 });
            }
            res.resume();
        });

        req.on('timeout', () => { req.destroy(); resolve({ status: 'offline', ms: 0 }); });
        req.on('error', () => { resolve({ status: 'offline', ms: 0 }); });
    });
}

app.get('/api/status', async (req, res) => {
    const urlString = req.query.url;
    if (!urlString) return res.json({ status: 'offline', ms: 0 });
    try {
        if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
            const result = await checkHttp(urlString);
            res.json(result);
        } else {
            const cleanUrl = urlString.replace(/^https?:\/\//, '').split('/')[0];
            let [host, portStr] = cleanUrl.split(':');
            let port = portStr ? parseInt(portStr) : 80;
            const result = await checkHostPort(host, port);
            res.json(result);
        }
    } catch (e) {
        res.json({ status: 'offline', ms: 0 });
    }
});

// --- ENDPOINT SYSINFO & BACKUP ---
const os = require('os');

app.get('/api/sysinfo', (req, res) => {
    const totalRam = os.totalmem();
    const freeRam = os.freemem();
    const usedRam = totalRam - freeRam;
    const ramUsagePercent = ((usedRam / totalRam) * 100).toFixed(1);
    
    const cpuCores = os.cpus().length;
    const loadAvg = os.loadavg()[0]; // load rata-rata 1 menit
    // Load avg bisa lebih besar dari jumlah core, cap di 100%
    const cpuUsagePercent = Math.min(((loadAvg / cpuCores) * 100), 100).toFixed(1);

    res.json({
        ram: ramUsagePercent,
        cpu: cpuUsagePercent,
        uptime: os.uptime()
    });
});

app.get('/api/backup', requireAuth, (req, res) => {
    const links = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let settings = { background: '', theme: 'dark' };
    if (fs.existsSync(SETTINGS_FILE)) settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    
    const backupData = { links, settings, timestamp: Date.now() };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=localdash-backup.json');
    res.send(JSON.stringify(backupData, null, 2));
});

app.post('/api/restore', requireAuth, upload.single('backupFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file backup' });
    
    try {
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const parsed = JSON.parse(fileContent);
        
        if (parsed.links) fs.writeFileSync(DATA_FILE, JSON.stringify(parsed.links, null, 2));
        if (parsed.settings) fs.writeFileSync(SETTINGS_FILE, JSON.stringify(parsed.settings, null, 2));
        
        // Hapus file temporary yang diupload
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Format file tidak valid' });
    }
});

app.listen(PORT, () => {
    console.log(`Professional Catalog Server berjalan di http://localhost:${PORT}`);
});
