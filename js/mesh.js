import {Keypoint} from "./keypoint.js";
import {validateDefined, validateInstanceOf, validateNonEmptyString, validatePositiveNumber} from "./validation.js";

export class Mesh {
    /** Creates a new Mesh object. */
    constructor() {
        this.faceKeypointSize = 2;
        this.bodyKeypointSize = 2;

        this.faceKeypointColour = "green";
        this.postKeypointColour = "magenta";

        this.faceKeypoints = [];
        this.bodyKeypoints = [];
    }

    /**
     * Draws the face Keypoints on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     */
    drawFaceKeypoints(canvasContext) {
        validateDefined(canvasContext);

        canvasContext.fillStyle = this.faceKeypointColour;
        for (const keypoint of this.faceKeypoints) {
            canvasContext.fillRect(keypoint.x, keypoint.y, this.faceKeypointSize, this.faceKeypointSize);
        }
    }

    /**
     * Draws the body Keypoints on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     */
    drawBodyKeypoints(canvasContext) {
        validateDefined(canvasContext);

        canvasContext.fillStyle = this.postKeypointColour;
        for (const keypoint of this.bodyKeypoints) {
            canvasContext.fillRect(keypoint.x, keypoint.y, this.bodyKeypointSize, this.bodyKeypointSize);
        }
    }

    /**
     * Draws a Keypoint on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     * @param keypoint Keypoint to draw.
     * @param colour Colour of the Keypoint rectangle.
     * @param size Size of the Keypoint rectangle, in pixels.
     */
    drawKeypoint(canvasContext, keypoint, colour, size) {
        validateDefined(canvasContext);
        validateInstanceOf(keypoint, Keypoint);
        validateNonEmptyString(colour);
        validatePositiveNumber(size);

        canvasContext.fillStyle = colour;

        const halfSize = size / 2;
        canvasContext.fillRect(keypoint.x - halfSize, keypoint.y - halfSize, size, size);
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

        const x = necklaceKeypoint.x + ((noseKeypoint.x - necklaceKeypoint.x) / 3);
        const y = necklaceKeypoint.y + ((noseKeypoint.y - necklaceKeypoint.y) / 3);
        const z = (noseKeypoint.z + necklaceKeypoint.z) / 2;
        return new Keypoint(x, y, z, 1, "choker");
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

        const x = (leftShoulder.x + rightShoulder.x) / 2;
        const y = (leftShoulder.y + rightShoulder.y) / 2;
        const z = (leftShoulder.z + rightShoulder.z) / 2;
        return new Keypoint(x, y, z, 1, "necklace");
    }

    /**
     * Sets the colour of the face Keypoints.
     *
     * @param {string} colour Colour of the face Keypoints.
     */
    setFaceKeypointColour(colour) {
        validateNonEmptyString(colour);
        this.faceKeypointColour = colour;
    }

    /**
     * Sets the colour of the body Keypoints.
     *
     * @param colour Colour of the body Keypoints.
     */
    setPostKeypointColour(colour) {
        validateNonEmptyString(colour);
        this.postKeypointColour = colour;
    }

    /**
     * Sets the size of the face Keypoints.
     *
     * @param {number} size Size of the face Keypoints.
     */
    setFaceKeypointSize(size) {
        validatePositiveNumber(size);
        this.faceKeyPointSize = size;
    }

    /**
     * Sets the size of the body Keypoints.
     *
     * @param {number} size Size of the body Keypoints.
     */
    setPostKeypointSize(size) {
        validatePositiveNumber(size);
        this.postKeyPointSize = size;
    }
}