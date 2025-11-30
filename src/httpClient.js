const https = require('https');
const crypto = require('crypto');

// Prepare the secure options to allow legacy renegotiation
// SSL_OP_LEGACY_SERVER_CONNECT is often needed for legacy servers
// SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION is specifically for the ERR_SSL_UNSAFE_LEGACY_RENEGOTIATION_DISABLED error
const secureOptions = crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT | 
                      (crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION || 0);

const agent = new https.Agent({
    secureOptions: secureOptions
});

/**
 * A fetch-like wrapper around https.request that handles legacy SSL renegotiation.
 * 
 * @param {string} url 
 * @param {Object} options 
 * @returns {Promise<Object>}
 */
function fetchClient(url, options = {}) {
    return new Promise((resolve, reject) => {
        const reqOptions = {
            method: options.method || 'GET',
            headers: options.headers || {},
            agent: agent
        };

        const req = https.request(url, reqOptions, (res) => {
            const chunks = [];
            
            res.on('data', (chunk) => chunks.push(chunk));
            
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                
                const response = {
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    json: async () => {
                        try {
                            return JSON.parse(body);
                        } catch (e) {
                            throw new Error('Failed to parse JSON response: ' + e.message);
                        }
                    },
                    text: async () => body
                };
                
                resolve(response);
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

module.exports = fetchClient;
