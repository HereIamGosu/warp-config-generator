const fetch = require('node-fetch');
const nacl = require('tweetnacl');
const { Buffer } = require('buffer');

// Генерация ключей
function generateKeys() {
    const keyPair = nacl.box.keyPair();
    return {
        privKey: Buffer.from(keyPair.secretKey).toString('base64'),
        pubKey: Buffer.from(keyPair.publicKey).toString('base64')
    };
}

// Формирование заголовков для запросов
function generateHeaders(token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// Отправка запроса к API
async function apiRequest(method, endpoint, body = null, token = null) {
    const options = {
        method,
        headers: generateHeaders(token),
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`https://api.cloudflareclient.com/v0i1909051800/${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`Ошибка при запросе к API: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Ошибка в запросе к API: ${error.message}`);
        throw error;  // Перебрасываем ошибку, чтобы она была обработана в вызывающей функции
    }
}

// Генерация конфигурации для WARP
async function generateWarpConfig() {
    const { privKey, pubKey } = generateKeys();

    // Регистрация устройства
    const regBody = {
        install_id: "",
        tos: new Date().toISOString(),
        key: pubKey,
        fcm_token: "",
        type: "ios",
        locale: "en_US"
    };

    let regResponse;
    try {
        regResponse = await apiRequest('POST', 'reg', regBody);
    } catch (error) {
        console.error('Ошибка при регистрации устройства:', error);
        return null;
    }

    const { id, token } = regResponse.result;

    // Включение WARP
    let warpResponse;
    try {
        warpResponse = await apiRequest('PATCH', `reg/${id}`, { warp_enabled: true }, token);
    } catch (error) {
        console.error('Ошибка при включении WARP:', error);
        return null;
    }

    const { peer_pub, peer_endpoint, client_ipv4, client_ipv6 } = warpResponse.result.config.peers[0];

    // Формируем конфиг
    const conf = `
[Interface]
PrivateKey = ${privKey}
Jc = 120
Jmin = 23
Jmax = 911
H1 = 1
H2 = 2
H3 = 3
H4 = 4
MTU = 1280
Address = ${client_ipv4}/32, ${client_ipv6}/128
DNS = 1.1.1.1, 2606:4700:4700::1111, 1.0.0.1, 2606:4700:4700::1001

[Peer]
PublicKey = ${peer_pub}
AllowedIPs = 138.128.136.0/21, 162.158.0.0/15, 172.64.0.0/13, 34.0.0.0/15, 34.2.0.0/16, 34.3.0.0/23, 34.3.2.0/24, 35.192.0.0/12, 35.208.0.0/12, 35.224.0.0/12, 35.240.0.0/13, 5.200.14.128/25, 66.22.192.0/18, 13.32.0.0/32, 13.35.0.0/32, 13.48.0.0/32, 13.64.0.0/32, 13.128.0.0/32, 13.192.0.0/32, 13.224.0.0/32, 13.240.0.0/32, 13.248.0.0/32, 13.252.0.0/32, 13.254.0.0/32, 13.255.0.0/32, 18.67.0.0/32, 23.20.0.0/32, 23.40.0.0/32, 23.64.0.0/32, 23.128.0.0/32, 23.192.0.0/32, 23.224.0.0/32, 23.240.0.0/32, 23.248.0.0/32, 23.252.0.0/32, 23.254.0.0/32, 23.255.0.0/32, 34.200.0.0/32, 34.224.0.0/32, 34.240.0.0/32, 34.248.0.0/32, 34.252.0.0/32, 34.254.0.0/32, 34.255.0.0/32, 35.160.0.0/32, 35.192.0.0/32, 35.224.0.0/32, 35.240.0.0/32, 35.248.0.0/32, 35.252.0.0/32, 35.254.0.0/32, 35.255.0.0/32, 108.138.0.0/32, 178.249.0.0/32, 172.67.213.0/32, 104.21.61.0/32, 71.18.247.0/24, 71.18.251.0/24, 71.18.252.0/23, 71.18.255.0/24, 103.136.220.0/23, 103.136.222.0/24, 118.26.132.0/24, 23.192.228.10/32
Endpoint = ${peer_endpoint}`;

    return conf;
}

// Генерация ссылки на конфиг в формате Base64
async function getWarpConfigLink() {
    try {
        const conf = await generateWarpConfig();
        if (!conf) return null;
        return Buffer.from(conf).toString('base64');
    } catch (error) {
        console.error('Ошибка при генерации конфига:', error);
        return null;
    }
}

// Экспортируем функцию для использования
module.exports = { getWarpConfigLink };
