import {Keypoint} from "./keypoint.js";
import {validateInstanceOf, validateNonEmptyString, validateNumber} from "./validation.js";

export class Mesh {
    /** Creates a new Mesh object. */
    constructor() {
        this.faceKeypoints = [];
        this.bodyKeypoints = [];

        this.chokerOffsets = [0, 0, 0];
        this.necklaceOffsets = [0, 0, 0];
    }

    /**
     * Updates the face Keypoints.
     *
     * @param {Object[{
     *   box: {
     *     xMin: number,
     *     xMax: number,
     *     yMin: number,
     *     yMax: number,
     *     width: number,
     *     height: number
     *   },
     *   keypoints: [{
     *     x: number,
     *     y: number,
     *     z: number,
     *     name: string|null
     *   }]
     * }]} rawFace Raw face data.
     */
    updateFaceKeypoints(rawFace) {
        // todo We know the face is not detected if rawFace is null, so we could hide/show jewellery based on this.
        if (rawFace == null || rawFace.keypoints == null) {
            return;
        }

        if (this.faceKeypoints.length === rawFace.keypoints.length) {
            for (let i = 0; i < this.faceKeypoints.length; i++) {
                this.faceKeypoints[i].update(
                    rawFace.keypoints[i].x,
                    rawFace.keypoints[i].y,
                    rawFace.keypoints[i].z,
                    1,
                    rawFace.keypoints[i].name
                );
            }
        } else {
            this.clearFaceKeypoints();

            for (const rawKeypoint of rawFace.keypoints) {
                this.addFaceKeypoint(
                    new Keypoint(
                        rawKeypoint.x,
                        rawKeypoint.y,
                        rawKeypoint.z,
                        1,
                        rawKeypoint.name
                    )
                );
            }
        }
    }

    /**
     * Updates the body Keypoints.
     *
     * @param {Object[{
     *   score: number,
     *   keypoints: [{
     *     score: number,
     *     part: string,
     *     position: [{
     *       x: number,
     *       y: number
     *     }]
     *   }]
     * }]} rawBody Raw body data.
     */
    updateBodyKeypoints(rawBody) {
        // todo We know the body is not detected if rawPost is null, so we could hide/show jewellery based on this.
        if (rawBody == null || rawBody.keypoints == null) {
            return;
        }

        if (this.bodyKeypoints.length === rawBody.keypoints.length) {
            for (let i = 0; i < this.bodyKeypoints.length; i++) {
                const rawKeypoint = rawBody.keypoints[i];
                this.bodyKeypoints[i].update(
                    rawKeypoint.x,
                    rawKeypoint.y,
                    null,
                    rawKeypoint.score,
                    rawKeypoint.name
                );
            }
        } else {
            this.clearBodyKeypoints();

            for (const rawKeypoint of rawBody.keypoints) {
                this.addBodyKeypoint(
                    new Keypoint(
                        rawKeypoint.x,
                        rawKeypoint.y,
                        null,
                        rawKeypoint.score,
                        rawKeypoint.name
                    )
                );
            }
        }
    }

    /**
     * Adds a keypoint to the set of face Keypoints.
     *
     * @param {Keypoint} keypoint Keypoint object.
     */
    addFaceKeypoint(keypoint) {
        validateInstanceOf(keypoint, Keypoint);
        this.faceKeypoints.push(keypoint);
    }

    /**
     * Adds a keypoint to the set of body Keypoints.
     *
     * @param {Keypoint} keypoint Keypoint object.
     */
    addBodyKeypoint(keypoint) {
        validateInstanceOf(keypoint, Keypoint);
        this.bodyKeypoints.push(keypoint);
    }

    /** Clears the set of face Keypoints. */
    clearFaceKeypoints() {
        this.faceKeypoints = [];
    }

    /** Clears the set of body Keypoints. */
    clearBodyKeypoints() {
        this.bodyKeypoints = [];
    }

    // todo Multiple points can have the same label, deal with this.
    /**
     * Attempts to retrieve a Keypoint by its label.
     *
     * @param {string} label Label of the Keypoint to retrieve.
     * @returns {Keypoint|null} Keypoint with the specified label, or null if no Keypoint with the specified label exists.
     */
    getKeypointByLabel(label) {
        validateNonEmptyString(label);

        if (label === "necklace") {
            return this.getNecklaceKeypoint();
        }

        for (const keypoint of this.faceKeypoints) {
            if (keypoint.label === label) {
                return keypoint;
            }
        }

        for (const keypoint of this.bodyKeypoints) {
            if (keypoint.label === label) {
                return keypoint;
            }
        }

        return null;
    }

    /**
     * Retrieves a list of all Keypoint labels.
     *
     * @returns {string[]} List of all Keypoint labels.
     */
    getKeypointLabels() {
        if (this.labels != null && this.labels.length > 0) {
            return this.labels;
        }

        const labels = [];
        for (const keypoint of this.faceKeypoints) {
            if (keypoint.label != null) {
                labels.push(keypoint.label);
            }
        }

        for (const keypoint of this.bodyKeypoints) {
            if (keypoint.label != null) {
                labels.push(keypoint.label);
            }
        }

        this.labels = labels;
        return labels;
    }

    /**
     * Retrieves the body Keypoints.
     *
     * @returns {Keypoint[]} Body Keypoints.
     */
    getBodyKeypoints() {
        return this.bodyKeypoints;
    }

    /**
     * Calculates and retrieves the position of the choker Keypoint.
     *
     * @returns {Keypoint|null} Position of the choker Keypoint, or null if the Keypoint cannot be calculated.
     */
    getChokerKeypoint() {
        const noseKeypoint = this.getKeypointByLabel("nose");
        if (noseKeypoint == null) {
            return null;
        }

        const necklaceKeypoint = this.getKeypointByLabel("necklace");
        if (necklaceKeypoint == null) {
            return null;
        }

        let x = necklaceKeypoint.x;
        x += ((noseKeypoint.x - necklaceKeypoint.x) / 3);
        x += this.chokerOffsets[0];

        let y = necklaceKeypoint.y;
        y += ((noseKeypoint.y - necklaceKeypoint.y) / 3);
        y += this.chokerOffsets[1];

        let z = necklaceKeypoint.z;
        z += (noseKeypoint.z + necklaceKeypoint.z) / 2;
        z += this.chokerOffsets[2];

        return new Keypoint(x, y, z, 1, "choker");
    }

    /**
     * Retrieves the face Keypoints.
     *
     * @returns {Keypoint[]} Face Keypoints.
     */
    getFaceKeypoints() {
        return this.faceKeypoints;
    }

    /**
     * Calculates and retrieves the position of the necklace Keypoint.
     *
     * @returns {Keypoint|null} Position of the necklace Keypoint, or null if the Keypoint cannot be calculated.
     */
    getNecklaceKeypoint() {
        const leftShoulder = this.getKeypointByLabel("left_shoulder");
        if (leftShoulder == null) {
            return null;
        }

        const rightShoulder = this.getKeypointByLabel("right_shoulder");
        if (rightShoulder == null) {
            return null;
        }

        let x = (leftShoulder.x + rightShoulder.x) / 2;
        x += this.necklaceOffsets[0];

        let y = (leftShoulder.y + rightShoulder.y) / 2;
        y += this.necklaceOffsets[1];

        let z = (leftShoulder.z + rightShoulder.z) / 2;
        z += this.necklaceOffsets[2];

        return new Keypoint(x, y, z, 1, "necklace");
    }

    /**
     * Sets the offsets of the choker Keypoint.
     *
     * @param {number} xOffset Offset to apply to the X coordinate.
     * @param {number} yOffset Offset to apply to the Y coordinate.
     * @param {number} zOffset Offset to apply to the Z coordinate.
     */
    setChokerOffsets(xOffset = 0, yOffset = 0, zOffset = 0) {
        validateNumber(xOffset);
        validateNumber(yOffset);
        validateNumber(zOffset);

        this.chokerOffsets = [xOffset, yOffset, zOffset];
    }

    /**
     * Sets the offsets of the necklace Keypoint.
     *
     * @param {number} xOffset Offset to apply to the X coordinate.
     * @param {number} yOffset Offset to apply to the Y coordinate.
     * @param {number} zOffset Offset to apply to the Z coordinate.
     */
    setNecklaceOffsets(xOffset = 0, yOffset = 0, zOffset = 0) {
        validateNumber(xOffset);
        validateNumber(yOffset);
        validateNumber(zOffset);

        this.necklaceOffsets = [xOffset, yOffset, zOffset];
    }
}