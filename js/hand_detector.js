import {validateInstanceOf, validateNumber} from "./validation.js";

/**
 * See the following link for more information about the hand detection model:
 * https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection/src/tfjs
 */
export class HandDetector {
    static instance;

    /**
     * Creates a new HandDetector object, or returns the existing one if it already exists.
     *
     * @returns {Promise<HandDetector>} A promise that resolves with the HandDetector object.
     */
    constructor() {
        if (HandDetector.instance) {
            return HandDetector.instance;
        }

        handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            {runtime: "tfjs"}
        ).then(detector => this.detector = detector);

        this.intervalId = null;
        this.lastRuntime = 0;

        HandDetector.instance = this;
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
            mesh.updateHandKeypoints(await this.detector.estimateHands(videoElement));
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
     * Retrieves the most recent runtime of the detector, in milliseconds.
     *
     * @returns {number} Most recent runtime of the detector, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}