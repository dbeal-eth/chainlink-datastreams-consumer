import type { WebSocket } from 'ws'

export default class LOLSDK {
  constructor (args: {
    clientID?: string,
    clientSecret?: string,
    hostname?: string,
    wsHostname?: string,
    feeds?: string[]
  })

  fetchFeed (args: { timestamp: string|number, feed: string }): Promise<Report>

  fetchFeeds (args: { timestamp: string|number, feeds: string[] }): Promise<Record<string, Report>>

  subscribeTo (feeds: string|string[]): Promise<WebSocket|null>

  unsubscribeFrom (feeds: string|string[]): Promise<WebSocket|null>

  disconnect (): void

  feeds: Set<string>

  on (event: string, cb: Function): this

  off (event: string, cb: Function): this

  once (event: string, cb: Function): this
}

export type Report = {
  feedId:                  string
  observationsTimestamp:   bigint
  benchmarkPrice:          bigint
  fullReport:              string
} & (
  {
    version:               'v1'
    bid:                   bigint
    ask:                   bigint
    currentBlockNum:       bigint
    currentBlockHash:      string
    validFromBlockNum:     bigint
    currentBlockTimeStamp: bigint
  } | {
    version:               'v2'
    nativeFee:             bigint
    linkFee:               bigint
    expiresAt:             number
  } | {
    version:               'v3'
    nativeFee:             bigint
    linkFee:               bigint
    expiresAt:             number
    bid:                   bigint
    ask:                   bigint
  }
)
