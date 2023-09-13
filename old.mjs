import * as crypto      from 'node:crypto'
import * as https       from 'node:https'
import * as querystring from 'node:querystring'

const CLIENT_ID     = '16678a93-e5a2-424d-98da-47793460bc4d';
const CLIENT_SECRET = 'HX7ALWUkf8s4faD52pNekYMfAzhgHnKPvwVFdyg26SQ2FQ2VMv4gkvFyLs7MXk5BeJ56gwhb5BsN52s6y95daXCrMsNsmmnQJSnjg2ejjFCbXcmHSTyunJhjKyczaCAP';
const BASE_URL      = "api.testnet-dataengine.chain.link";

const path     = '/api/v1/reports';
const bulkPath = '/api/v1/reports/bulk';

fetchSingleReportSingleFeed();
//fetchSingleReportManyFeeds();

class SingleReport {
  constructor(feedID, validFromTimestamp, observationsTimestamp, fullReport) {
    this.feedID = feedID;
    this.validFromTimestamp = validFromTimestamp;
    this.observationsTimestamp = observationsTimestamp;
    this.fullReport = fullReport;
  }
}

class SingleReportResponse {
  constructor(report) {
    this.report = report;
  }
}

class BulkReportResponse {
  constructor(reports) {
    this.reports = reports;
  }
}

function generateHMAC(method, path, body, clientId, timestamp, userSecret) {
  const serverBodyHash = crypto.createHash('sha256').update(body).digest();
  const serverBodyHashString = `${method} ${path} ${serverBodyHash.toString('hex')} ${clientId} ${timestamp}`;
  const signedMessage = crypto.createHmac('sha256', Buffer.from(userSecret, 'utf8')).update(serverBodyHashString).digest();
  const userHmac = signedMessage.toString('hex');
  return userHmac;
}

function generateHeaders(method, path, clientId, userSecret) {
  const header = {};
  const timestamp = Date.now();
  const hmacString = generateHMAC(method, path, '', clientId, timestamp, userSecret);
  header['Authorization'] = clientId;
  header['X-Authorization-Timestamp'] = timestamp.toString();
  header['X-Authorization-Signature-SHA256'] = hmacString;
  return header;
}

function fetchSingleReportSingleFeed() {
  const clientId = CLIENT_ID;
  const userSecret = CLIENT_SECRET;
  const feedId = '0x00023496426b520583ae20a66d80484e0fc18544866a5b0bfee15ec771963274';
  const params = {
    feedId: feedId,
    blockTimestamp: '1000000'
  };
  const options = {
    method: 'GET',
    hostname: BASE_URL,
    path: `${path}?${querystring.stringify(params)}`,
    headers: generateHeaders('GET', path, clientId, userSecret)
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          if (parsedData.error) {
            console.log(parsedData);
            resolve();
          } else {
            const report = new SingleReport(
              parsedData.report.feedID,
              parsedData.report.validFromTimestamp,
              parsedData.report.observationsTimestamp,
              parsedData.report.fullReport
            );
            resolve(report);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.end();
  });
}

function fetchSingleReportManyFeeds() {
  const clientId = CLIENT_ID;
  const userSecret = CLIENT_SECRET;
  const feedIds = [
    '0x00023496426b520583ae20a66d80484e0fc18544866a5b0bfee15ec771963274',
    '0x0002f18a75a7750194a6476c9ab6d51276952471bd90404904211a9d47f34e64'
  ];
  const params = {
    feedIds: feedIds.join(','),
    blockTimestamp: '1000000'
  };
  const options = {
    method: 'GET',
    hostname: BASE_URL,
    path: `${bulkPath}?${querystring.stringify(params)}`,
    headers: generateHeaders('GET', bulkPath, clientId, userSecret)
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          if (parsedData.error) {
            console.log(parsedData);
            resolve();
          } else {
            const reports = parsedData.reports.map((report) => new SingleReport(report.feedID, report.validFromTimestamp, report.observationsTimestamp, report.fullReport));
            resolve(reports);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.end();
  });
}
