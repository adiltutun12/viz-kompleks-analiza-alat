const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');

// Dinamički import za node-fetch v3
let fetch;
(async () => {
  try {
    const fetchModule = await import('node-fetch');
    fetch = fetchModule.default;
    console.log('node-fetch loaded successfully');
  } catch (error) {
    console.error('Failed to load node-fetch:', error.message);
    console.log('Try: npm install node-fetch@2');
    process.exit(1);
  }
})();

const app = express();
const PORT = process.env.PORT || 3001;

// Kreiraj custom agent sa većim timeout-om
const httpsAgent = new https.Agent({
  timeout: 15000,
  keepAlive: true,
  maxSockets: 5
});

const httpAgent = new http.Agent({
  timeout: 15000,
  keepAlive: true,
  maxSockets: 5
});

// Enable CORS za sve rute
app.use(cors());
app.use(express.json());

// Middleware da provjeri da li je fetch učitan
const ensureFetch = (req, res, next) => {
  if (!fetch) {
    return res.status(503).json({
      error: 'Service unavailable - fetch not loaded',
      message: 'Server is still starting up, please try again in a moment'
    });
  }
  next();
};

// CORS proxy endpoint
app.get('/api/proxy', ensureFetch, async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validiraj URL format
    const urlObj = new URL(url);
    
    console.log(`Proxying request to: ${url}`);
    
    // AbortController za timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal,
      agent: urlObj.protocol === 'https:' ? httpsAgent : httpAgent
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`Response not OK: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        statusText: response.statusText
      });
    }

    const html = await response.text();
    
    console.log(`Successfully fetched ${html.length} characters from ${url}`);
    
    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      html: html,
      url: url,
      contentLength: html.length
    });

  } catch (error) {
    console.error('Proxy error for', url, ':', error.message);
    
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout after 15 seconds',
        code: 'TIMEOUT'
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({
        success: false,
        error: 'Domain not found - DNS lookup failed',
        code: 'DNS_ERROR'
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        success: false,
        error: 'Connection refused by server',
        code: 'CONNECTION_ERROR'
      });
    }

    if (error.code === 'ECONNRESET') {
      return res.status(502).json({
        success: false,
        error: 'Connection reset by server',
        code: 'CONNECTION_RESET'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});


// URL validacija endpoint
app.get('/api/validate', ensureFetch, async (req, res) => {
  let { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Očisti URL od razmaka
  url = url.trim();

  // Auto-dodaj https:// ako nema protokol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Dodatna provjera - ako korisnik samo kuca "https" pokušaj riješiti
  if (url === 'https://https' || url === 'http://https') {
    return res.status(400).json({
      valid: false,
      error: 'Invalid URL format',
      reachable: false,
      url: url,
      message: 'Molimo unesite kompletan URL (npr. avaz.ba)'
    });
  }

  try {
    const urlObj = new URL(url);
    console.log(`Validating: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Povećaj timeout

    // POKUŠAJ 1: Standardni request sa browser headers
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'bs-BA,bs;q=0.9,hr;q=0.8,sr;q=0.7,en-US;q=0.6,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      signal: controller.signal,
      agent: urlObj.protocol === 'https:' ? httpsAgent : httpAgent,
      redirect: 'manual' // Prati redirects ručno
    });

    clearTimeout(timeoutId);

    // Ako dobijemo redirect, pratimo ga ručno
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        console.log(`Following redirect to: ${redirectUrl}`);
        return res.redirect(`/api/validate?url=${encodeURIComponent(redirectUrl)}`);
      }
    }

    // Ako je status 403, probajmo drugačije pristupe
    if (response.status === 403 || response.status === 429) {
      console.log(`Got ${response.status}, trying alternative approaches for: ${url}`);
      
      // POKUŠAJ 2: Simuliraj "realni" browser request sa delay-om
      await new Promise(resolve => setTimeout(resolve, 2000)); // Čekaj 2 sekunde
      
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 15000);
      
      try {
        // Koristi drugačije header-e koji izgledaju "ljudski"
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'bs,en;q=0.9,hr;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': `https://www.google.com/`,
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          signal: controller2.signal,
          agent: urlObj.protocol === 'https:' ? httpsAgent : httpAgent
        });
        
        clearTimeout(timeoutId2);
      } catch (error) {
        console.error('Alternative approach failed:', error.message);
      }
    }

    // POKUŠAJ 3: Ako i dalje ne uspije, probaj samo dobiti DNS info
    if (response.status === 403 || response.status === 429) {
      console.log(`Still getting ${response.status}, trying DNS validation only for: ${url}`);
      
      // Provjeri da li se može uspostaviti TCP konekcija (bez HTTP)
      try {
        // Ovo će baciti grešku ako host ne postoji
        await new Promise((resolve, reject) => {
          const socket = require('net').createConnection({
            host: urlObj.hostname,
            port: urlObj.port || 443
          }, () => {
            socket.end();
            resolve();
          });
          
          socket.on('error', reject);
          setTimeout(() => reject(new Error('Timeout')), 5000);
        });
        
        // Ako stigne ovdje, host postoji i prima konekcije
        return res.json({
          valid: true,
          status: 403,
          statusText: 'Forbidden',
          reachable: false,
          method: 'TCP Connection',
          url: url,
          note: 'Host exists but returns 403 Forbidden for HTTP requests'
        });
      } catch (socketError) {
        console.log('TCP connection failed:', socketError.message);
      }
    }

    // Standardna logika za ostale status kodove
    const isPageValid = response.status === 403 || response.status === 429 || 
                       (response.status >= 200 && response.status < 400);
    
    const isReachable = response.status >= 200 && response.status < 400;
    
    res.json({
      valid: isPageValid,
      status: response.status,
      statusText: response.statusText,
      reachable: isReachable,
      method: 'GET',
      url: url,
      note: response.status === 403 ? 
            'Server returns 403 - page exists but access is restricted' : 
            response.status === 429 ?
            'Server returns 429 - too many requests (rate limiting)' :
            undefined
    });

  } catch (error) {
    console.error('Validation error for', url, ':', error.message, error.code);

    let valid = false;
    let reachable = false;

    if (error.code === 'ENOTFOUND') {
      valid = false; // domena ne postoji
    } else if (error.name === 'AbortError') {
      valid = false;
      reachable = false;
    } else if (error.code === 'ECONNREFUSED') {
      valid = true;   // Server postoji ali odbija konekciju
      reachable = false;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      valid = true;   // Server postoji ali ne odgovara na vrijeme
      reachable = false;
    } else {
      valid = false;
      reachable = false;
    }

    res.json({
      valid,
      reachable,
      error: error.message,
      code: error.code || error.name,
      url: url
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'CORS Proxy Server is running',
    fetchAvailable: !!fetch
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Web Complexity Analyzer CORS Proxy',
    version: '1.0.2',
    status: 'running',
    fetchAvailable: !!fetch,
    endpoints: {
      proxy: '/api/proxy?url=<URL>',
      validate: '/api/validate?url=<URL>',
      health: '/api/health'
    },
    examples: {
      validate: '/api/validate?url=www.klix.ba',
      proxy: '/api/proxy?url=https://www.klix.ba'
    }
  });
});

// Sačekaj da se fetch učita prije pokretanja servera
setTimeout(() => {
  if (!fetch) {
    console.error('fetch still not available after 5 seconds');
    console.log('Run: npm uninstall node-fetch && npm install node-fetch@2');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`CORS Proxy Server running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`Validate: http://localhost:${PORT}/api/validate?url=www.klix.ba`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}, 2000);