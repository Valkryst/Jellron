export class Detector {
    /** Creates a new Detector object. */
    constructor() {
        this.detector = null;
        this.intervalId = null;
        this.lastRuntime = 0;
    }

    /**
     * Starts the detector.
     *
     * @param {number} updatesPerSecond Desired number of updates per second.
     * @param {HTMLVideoElement} videoElement Video element to use for detection.
     * @param {Mesh} mesh Mesh to update with the detected body.
     */
    start(updatesPerSecond, videoElement, mesh) {
        throw new Error("Not implemented.");
    }

    /** Stops the detector. */
    stop() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Relabels a raw Keypoint object.
     *
     * @param {object} rawObject A raw object, from the detector, that contains all the keypoints.
     * @param {object} rawKeypoint Raw Keypoint object to relabel.
     */
    relabelKeypoint(rawObject, rawKeypoint) {
        throw new Error("Not implemented.");
    }

    /**
     * Determines whether the detector is ready to be used.
     *
     * @returns {boolean} Whether the detector is ready to be used.
     */
    isReady() {
        return this.detector != null;
    }

    /**
     * Determines whether the detector is currently running.
     *
     * @returns {boolean} Whether the detector is currently running.
     */
    isRunning() {
        return this.intervalId != null;
    }

    /**
     * Retrieves the most recent runtime of the detector, in milliseconds.
     *
     * @returns {number} Most recent runtime of the detector, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}