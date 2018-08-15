const http = require('http');
const url = require('url');
const net = require('net');
const QQwry = require('./src/lib/qqwry');
const Taobao = require('./src/lib/taobao');

const qqwry = new QQwry();
const taobao = new Taobao();

const server = http.createServer((req, res) => {
  const urlObj = url.parse(req.url, true);
  const path = urlObj.pathname;

  if (path === '/api/ip') {
    let ip = urlObj.query && urlObj.query.ip;

    if (!ip) {
      ip = req.headers['x-real-ip'];
    }
    
    if (!net.isIPv4(ip)) {
      res.statusCode = 400;
      res.end('invalid param');
      return;
    }

    function sendResult(data) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(JSON.stringify(data));
    }

    qqwry.search(ip)
      .then(result => {
        if (result) {
          sendResult(result);
        } else {
          return taobao.search(ip)
            .then(result => {
              sendResult(result);
            });
        }
      })
      .catch(err => {
        console.error(err);

        res.statusCode = 500;
        res.end('server error');
      });
  } else {
    res.statusCode = 404;
    res.end('not found');
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server listening port: ${port}`);
});