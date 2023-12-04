import {Detector} from "./detector.js";
import {Mesh} from "../mesh.js";
import {validateInstanceOf} from "../validation.js";


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

    /** @type Detector['detectAndUpdate'] */
    async detectAndUpdate(frame, mesh) {
        validateInstanceOf(frame, tf.Tensor);
        validateInstanceOf(mesh, Mesh);

        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        const currentTime = performance.now();

        let rawBodies = [];
        try {
            rawBodies = await this.detector.estimatePoses(frame);
        } catch (e) {
            /*
             * Depending on the state of the video element, this can throw a "Requested texture size [0x0] is
             * invalid." error. It doesn't seem to cause any issues, so we ignore it.
             */
        }

        if (rawBodies.length > 0) {
            mesh.updateBodyKeypoints(rawBodies[0]);
        }

        this.lastRuntime = performance.now() - currentTime;
    }
}