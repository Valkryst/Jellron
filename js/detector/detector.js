import {RunnableInterval} from "../runnable_interval.js";

export class Detector extends RunnableInterval {
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
}