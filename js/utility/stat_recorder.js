import {validateNumber} from "./validation.js";

export class StatRecorder {
    /**
     * Creates a new instance of StatRecorder.
     *
     * @param {number} maximumEntries Maximum number of entries to record.
     */
    constructor(maximumEntries) {
        validateNumber(maximumEntries);

        this.maximumEntries = maximumEntries;
        this.entries = [];

        this.resetMemoizedValues();
    }

    /**
     * Adds an entry to the recorder.
     *
     * @param {number} entry Entry to add.
     */
    record(entry) {
        validateNumber(entry);

        this.entries.push(entry);

        if (this.entries.length > this.maximumEntries) {
            this.entries.shift();
        }

        this.resetMemoizedValues();
    }

    /** Resets the memoized values. */
    resetMemoizedValues() {
        this.average = null;
        this.maximum = null;
        this.minimum = null;
    }

    /**
     * Calculates the average of all entries.
     *
     * @returns {number} Average of all entries.
     */
    getAverage() {
        if (this.average != null) {
            return this.average;
        }

        let sum = 0;
        for (const value of this.entries) {
            sum += value;
        }
        return this.average = sum / this.entries.length;
    }

    /**
     * Returns the maximum of all entries.
     *
     * @returns {number} Maximum of all entries.
     */
    getMaximum() {
        if (this.minimum != null) {
            return this.minimum;
        }

        return Math.max(...this.entries);
    }

    /**
     * Returns the minimum of all entries.
     *
     * @returns {number} Minimum of all entries.
     */
    getMinimum() {
        if (this.maximum != null) {
            return this.maximum;
        }

        return Math.min(...this.entries);
    }
}