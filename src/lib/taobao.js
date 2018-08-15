const http = require('http');
const net = require('net');
const URL = require('url');

class Taobao {

  constructor() {
    this.api = 'http://ip.taobao.com/service/getIpInfo.php';
  }

  search(ip) {
    if (!net.isIPv4(ip)) {
      return Promise.reject(new Error('invalid ip v4 address: ', ip));
    }

    const url = `${this.api}?ip=${ip}`;

    return new Promise((resolve, reject) => {
      http.get(url, res => {
        res.setEncoding('utf8');
        let rawData = '';

        res.on('data', chunk => {
          rawData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);

            if (parsedData.code !== 0 || !parsedData.data) {
              reject(new Error('call taobao api fail'));
              return;
            }

            const data = parsedData.data;

            resolve({
              province: data.region,
              city: data.city,
              isp: data.isp,
            });
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', e => reject(e));
    });
  }
}

module.exports = Taobao;