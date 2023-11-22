import {validateInstanceOf, validateNumber} from "./validation.js";

/*
 * See the following link for more information about the face landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md
 */
export class FaceDetector {
    static instance;

    /**
     * Creates a new FaceDetector object, or returns the existing one if it already exists.
     *
     * @returns {Promise<FaceDetector>} A promise that resolves with the FaceDetector object.
     */
    constructor() {
        if (FaceDetector.instance) {
            return FaceDetector.instance;
        }

        faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: "tfjs" }
        ).then(detector => this.detector = detector);

        this.intervalId = null;
        this.lastRuntime = 0;

        FaceDetector.instance = this;
    }

    /**
     * Starts the detector.
     *
     * @param updatesPerSecond Desired number of updates per second.
     * @param videoElement Video element to use for detection.
     * @param mesh Mesh to update with the detected face.
     */
    async start(updatesPerSecond, videoElement, mesh) {
        validateNumber(updatesPerSecond);
        validateInstanceOf(videoElement, HTMLVideoElement)

        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            this.stop();
        }

        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            const rawFaces = await this.detector.estimateFaces(videoElement);
            const rawFace = rawFaces[0];
            mesh.updateFaceKeypoints(rawFace);

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
     * Retrieves the most recent runtime of the detector, in milliseconds.
     *
     * @returns {number} Most recent runtime of the detector, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}