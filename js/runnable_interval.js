export class RunnableInterval {
    /** Creates a new RunnableInterval. */
    constructor() {
        this.intervalId = null;
        this.lastRuntime = 0;
    }

    /** Starts the interval. */
    start() {
        throw new Error("Not implemented.");
    }

    /** Stops the interval. */
    stop() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Determines whether the interval is currently running.
     *
     * @returns {boolean} Whether the interval is currently running.
     */
    isRunning() {
        return this.intervalId != null;
    }

    /**
     * Retrieves the most recent runtime of the interval, in milliseconds.
     *
     * @returns {number} Most recent runtime of the interval, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}