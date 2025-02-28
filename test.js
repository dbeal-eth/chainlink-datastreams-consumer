import ChainlinkLowLatencySDK, { Report } from "./index.js";
import assert from "node:assert";
import "dotenv/config";

const FEED_ID =
  "0x00037da06d56d083fe599397a4769a042d63aa73dc4ef57709d31e9971a5b439";
const FEED_TS = "1740739164";

const config = {
  hostname: process.env.CHAINLINK_API_URL,
  wsHostname: process.env.CHAINLINK_WEBSOCKET_URL,
  clientID: process.env.CHAINLINK_CLIENT_ID,
  clientSecret: process.env.CHAINLINK_CLIENT_SECRET,
};

for (const feed of [
  "0x00037da06d56d083fe599397a4769a042d63aa73dc4ef57709d31e9971a5b439",
]) {
  const report = await new ChainlinkLowLatencySDK(config).fetchFeed({
    timestamp: FEED_TS,
    feed,
  });
  assert(report instanceof Report);
  console.log({ feed, report });
}

const reports = await new ChainlinkLowLatencySDK(config).fetchFeeds({
  timestamp: FEED_TS,
  feeds: [FEED_ID],
});

assert(typeof reports === "object");

console.log({ reports });

const SDK = new ChainlinkLowLatencySDK({
  ...config,
  feeds: [FEED_ID],
});

SDK.once("report", async (report1) => {
  console.log({ report1 });
  await SDK.unsubscribeFrom(report1.feedId);
  SDK.once("report", (report2) => {
    console.log({ report2 });
    SDK.disconnect();
  });
});

await SDK.subscribeTo([FEED_ID]);

SDK.once("report", async (report3) => {
  console.log({ report3 });
  SDK.disconnect();
});

assert.throws(() => Report.fromSocketMessage({}));

assert.throws(() => Report.fromAPIResponse({}));

assert.throws(() => Report.fromBulkAPIResponse({}));
