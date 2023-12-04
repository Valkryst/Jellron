export class Detector {
    /** Creates a new Detector object. */
    constructor() {
        this.detector = null;
        this.lastRuntime = 0;
    }

    /**
     * Detects keypoints in the specified frame and updates the specified mesh.
     *
     * @param {tf.Tensor} frame Frame to detect keypoints in.
     * @param {Mesh} mesh Mesh to update.
     *
     * @returns {Promise<void>} A promise that resolves when the function has completed.
     */
    async detectAndUpdate(frame, mesh) {
        throw new Error("Not implemented.");
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
     * Retrieves the most recent runtime of the detector, in milliseconds.
     *
     * @returns {number} Most recent runtime of the detector, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}