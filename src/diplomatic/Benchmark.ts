import {debounce, sum} from "lodash";

/**
 * privacy.reduceTimerPrecision = false
 */
export class Benchmark {
  private callDurations = []
  constructor(
    private name: string
  ) {}

  public run(toCall: () => void) {
    const start = performance.now();
    toCall()
    let end = performance.now();
    let duration = end - start;
    this.callDurations.push(duration)
    this.logDebounced()
  }

  private logDebounced = debounce(() => {
    const summed = sum(this.callDurations);
    let callCount = this.callDurations.length;
    const average = summed / callCount
    console.log(`${this.name} took ${summed.toFixed(2)}ms, on average: ${average.toFixed(2)}ms (${callCount} calls)`)
    this.callDurations.length = 0
  }, 1000)
}
