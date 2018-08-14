const fs = require('fs');
const path = require('path');
const net = require('net');
const gbk = require('gbk.js');

class QQwry {
  constructor() {
    const raw = fs.readFileSync(path.resolve(__dirname, '../db/qqwry.dat'), { encoding: null });

    this.indexBegin = raw.readUInt32LE(0);
    this.indexEnd = raw.readUInt32LE(4);
    this.raw = raw;
  }

  search(ip) {
    if (!net.isIPv4(ip)) {
      throw new Error('invalid ip v4 address: ', ip);
    }

    const _ip = this._convertIPtoInt32(ip);

    const indexOffset = this._locateIpIndexOffset(_ip); 

    if (!indexOffset) {
      return null;
    }

    const location = this._locateLocation(indexOffset);

    return location;
  }

  _locateLocation(indexOffset) {
    const location = {};
    const locationOffset = this.raw.readUIntLE(indexOffset + 4, 3);
    const mode = this.raw.readUIntLE(locationOffset + 4, 1);

    if (mode === 1) {
      const countryOffset = this.raw.readUIntLE(locationOffset + 5, 3);
      const subCountryMode = this.raw.readUIntLE(countryOffset, 1);

      if (subCountryMode === 2) {
        const subCountryOffset = this.raw.readUIntLE(countryOffset + 1, 3);

        location.area = gbk.decode(this._getTextBuffer(subCountryOffset));
        location.isp = gbk.decode(this._getISPBuffer(countryOffset + 4));
      } else {
        const countryBuffer = this._getTextBuffer(countryOffset);
        const areaBuffer = this._getISPBuffer(countryOffset + countryBuffer.length + 1);

        location.area = gbk.decode(countryBuffer);
        location.isp = gbk.decode(areaBuffer);
      }
    } else if (mode === 2) {
      const countryOffset = this.raw.readUIntLE(locationOffset + 5, 3);

      location.area = gbk.decode(this._getTextBuffer(countryOffset));
      location.isp = gbk.decode(this._getISPBuffer(locationOffset + 8));
    } else {
      const countryBuffer = this._getTextBuffer(locationOffset + 4);
      const areaBuffer = this._getISPBuffer(locationOffset + 4 + countryBuffer.length + 1);

      location.area = gbk.decode(countryBuffer);
      location.isp = gbk.decode(areaBuffer);
    }

    return location;
  }

  _getISPBuffer(offset) {
    const mode = this.raw.readUIntLE(offset, 1);

    if (mode === 1 || mode === 2) {
      const ispOffset = this.raw.readUIntLE(offset + 1, 3);
      return this._getTextBuffer(ispOffset);
    } else {
      return this._getTextBuffer(offset);
    }
  }

  _getTextBuffer(offset) {
    return this.raw.slice(offset, this.raw.indexOf(0, offset));
  }

  _locateIpIndexOffset(ip) {
    let begin = this.indexBegin;
    let end = this.indexEnd;
    let mid, temp;

    for (;begin < end;) {
      mid = this._getMiddleOffset(begin, end);
      temp = this.raw.readUInt32LE(mid);

      if (ip > temp) {
        begin = mid;
      }else if (ip < temp) {
        if (mid === end) {
          mid -= 7;
          break;
        }

        end = mid;
      } else {
        break;
      }
    }

    return mid;
  }

  _convertIPtoInt32(ip) {
    ip = ip.split('.');
    return (parseInt(ip[0]) << 24 | parseInt(ip[1]) << 16 | parseInt(ip[2]) << 8 | parseInt(ip[3])) >>> 0;
  }

  _getMiddleOffset(begin, end) {
    const records = ((end - begin) / 7 >> 1) * 7 + begin;
    return records ^ begin ? records : records + 7;
  }
}

module.exports = QQwry;
