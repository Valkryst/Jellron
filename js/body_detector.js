import {validateInstanceOf, validateNumber} from "./validation.js";

/**
 * See the following link for more information about the body landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
 */
export class BodyDetector {
    static instance;

    /**
     * Creates a new BodyDetector object, or returns the existing one if it already exists.
     *
     * @returns {Promise<BodyDetector>} A promise that resolves with the BodyDetector object.
     */
    constructor() {
        if (BodyDetector.instance) {
            return BodyDetector.instance;
        }

        poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { runtime: "tfjs"}
        ).then(detector => this.detector = detector);

        this.intervalId = null;
        this.lastRuntime = 0;

        BodyDetector.instance = this;
    }

    /**
     * Starts the detector.
     *
     * @param updatesPerSecond Desired number of updates per second.
     * @param videoElement Video element to use for detection.
     * @param mesh Mesh to update with the detected body.
     */
    async start(updatesPerSecond, videoElement, mesh) {
        validateNumber(updatesPerSecond);
        validateInstanceOf(videoElement, HTMLVideoElement);

        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            this.stop();
        }

        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            const rawBodies = await this.detector.estimatePoses(videoElement);
            if (rawBodies.length === 0) {
                return;
            }

            const rawBody = rawBodies[0];
            mesh.updateBodyKeypoints(rawBody);

            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / updatesPerSecond);
    }

    /** Stops the detector. */
    stop() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
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