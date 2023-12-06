import {RunnableInterval} from "../runnable_interval.js";
import {validateInstanceOf} from "../utility/validation.js";

export class Detector extends RunnableInterval {
    /** Current frame to be processed. */
    static currentFrame = null;

    /** Creates a new Detector. */
    constructor() {
        super();
        this.detector = null;
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
     * Determines whether the underlying TFJS detector is ready to be used.
     *
     * @returns {boolean} Whether the underlying TFJS detector is ready to be used.
     */
    isReady() {
        return this.detector != null;
    }

    /**
     * Retrieves the current frame.
     *
     * @returns {Tensor} Current frame.
     */
    static getCurrentFrame() {
        return Detector.currentFrame;
    }

    /**
     * Sets the current frame.
     *
     * @param frame New current frame.
     */
    static setCurrentFrame(frame) {
        Detector.currentFrame?.dispose();
        Detector.currentFrame = frame;
    }
}