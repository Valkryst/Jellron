import {Detector} from "./detector.js";
import {Mesh} from "../mesh.js";
import {validateInstanceOf} from "../utility/validation.js";

/**
 * See the following link for more information about the body landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
 */
export class BodyDetector extends Detector {
    /** Desired number of frames per second. */
    static fps = 30;

    /** Singleton instance of the HandDetector. */
    static instance;

    /**
     * Creates a new BodyDetector, or returns the existing one if it already exists.
     *
     * @param {Mesh} mesh Mesh to update with the detected body keypoints.
     */
    constructor(mesh) {
        if (BodyDetector.instance) {
            return BodyDetector.instance;
        }

        validateInstanceOf(mesh, Mesh);

        super();
        BodyDetector.instance = this;

        this.mesh = mesh;
        this.inputElement = document.getElementById("jellron-video-canvas");

        poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { runtime: "tfjs"}
        ).then(detector => {
            this.detector = detector;
            this.dispatchEvent(new CustomEvent("ready"));
        });
    }

    /** @type RunnableInterval["start"] */
    start() {
        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            throw new Error("Already running.");
        }

        this.dispatchEvent(new CustomEvent("started"));
        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            let rawBodies = [];
            try {
                rawBodies = await this.detector.estimatePoses(this.inputElement);
            } catch (e) {
                /*
                 * Depending on the state of the video element, this can throw a "Requested texture size [0x0] is
                 * invalid." error. It doesn't seem to cause any issues, so we ignore it.
                 */
            }

            if (rawBodies.length > 0) {
                const rawBody = rawBodies[0];
                this.mesh.updateBodyKeypoints(rawBody);
            }

            this.lastRuntime = performance.now() - currentTime;
            this.dispatchEvent(new CustomEvent("updated", {detail: {runtime: this.lastRuntime}}));
        }, 1000 / BodyDetector.fps);
    }
}