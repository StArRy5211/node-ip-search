const QQwry = require('../lib/qqwry');
const Taobao = require('../lib/taobao');

const qqwry = new QQwry();

qqwry.search('223.71.87.228').then(result => console.log(result));
qqwry.search('121.69.46.122').then(result => console.log(result));
qqwry.search('60.9.64.0').then(result => console.log(result));
qqwry.search('60.9.79.0').then(result => console.log(result));
qqwry.search('60.9.52.0').then(result => console.log(result));

const taobao = new Taobao();

taobao.search('223.71.87.228').then(result => console.log(result));


