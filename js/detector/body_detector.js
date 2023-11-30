import {Detector} from "./detector.js";
import {validateInstanceOf, validateNumber} from "../validation.js";


/**
 * See the following link for more information about the body landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
 */
export class BodyDetector extends Detector {
    static instance;

    /** Creates a new BodyDetector object, or returns the existing one if it already exists. */
    constructor() {
        if (BodyDetector.instance) {
            return BodyDetector.instance;
        }

        super();
        BodyDetector.instance = this;

        poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { runtime: "tfjs"}
        ).then(detector => this.detector = detector);
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

            let rawBodies = [];
            try {
                rawBodies = await this.detector.estimatePoses(videoElement);
            } catch (e) {
                /*
                 * Depending on the state of the video element, this can throw a "Requested texture size [0x0] is
                 * invalid." error. It doesn't seem to cause any issues, so we ignore it.
                 */
            }

            if (rawBodies.length === 0) {
                this.lastRuntime = performance.now() - currentTime;
                return;
            }

            const rawBody = rawBodies[0];
            mesh.updateBodyKeypoints(rawBody);

            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / updatesPerSecond);
    }
}