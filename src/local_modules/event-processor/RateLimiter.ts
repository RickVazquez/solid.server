import Bottleneck from 'bottleneck'

export default class RateLimiter {
  private readonly limiter: Bottleneck

  constructor(maxRequestsPerSecond: number) {
    const intervalMs = 1000 / maxRequestsPerSecond
    this.limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: intervalMs
    })
  }

  wrap(fn: any): any {
    return this.limiter.wrap(fn)
  }
}
