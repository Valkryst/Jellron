import {Keypoint} from "./keypoint.js";
import {validateInstanceOf, validateNonEmptyString, validateNumber} from "./validation.js";

export class Mesh {
    /** Creates a new Mesh object. */
    constructor() {
        this.faceKeypoints = [];
        this.bodyKeypoints = [];

        this.chokerOffsets = [0, 0, 0];
        this.leftEarlobeOffsets = [0, 0, 0];
        this.necklaceOffsets = [0, 0, 0];
        this.rightEarlobeOffsets = [0, 0, 0];
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
                    this.renameFaceKeypoint(i, rawFace.keypoints[i].name)
                );
            }
        } else {
            this.clearFaceKeypoints();

            for (let i = 0 ; i < rawFace.keypoints.length; i++) {
                const rawKeypoint = rawFace.keypoints[i];
                this.addFaceKeypoint(
                    new Keypoint(
                        rawKeypoint.x,
                        rawKeypoint.y,
                        rawKeypoint.z,
                        1,
                        this.renameFaceKeypoint(i, rawKeypoint.name)
                    )
                );
            }
        }
    }

    /**
     * Renames a face Keypoint, if necessary.
     *
     * Some calculations require specific points which have generic names. To get around this, we rename
     * these points to something more specific.
     *
     * The array of points is, as far as I can tell, always in the same order. This means that we can
     * reference the following mesh diagram to find specific points and rename them.
     *
     * https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/mesh_map.jpg
     *
     * @param index Index of the Keypoint, in the array of raw face Keypoints.
     * @param name Current name of the Keypoint.
     *
     * @returns {string} Keypoint name.
     */
    renameFaceKeypoint(index, name) {
        switch (index) {
            case 10: {
                name = "top_edge_face";
                break;
            }
            case 152: {
                name = "bottom_edge_face";
                break;
            }
            case 164: {
                name = "midpoint_between_nose_and_mouth";
                break;
            }
            case 234: {
                name = "right_edge_face";
                break;
            }
            case 454: {
                name = "left_edge_face";
                break;
            }
        }

        return name;
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
     * Calculates and retrieves the positions of the earlobe Keypoints.
     *
     * @returns {Keypoint[]} Earlobe Keypoints. Element [0] is the left earlobe, and [1] is the right earlobe. The both Keypoints will be null if either one cannot be calculated.
     */
    getEarlobeKeypoints() {
        let earlobes = [null, null];

        const leftEar = this.getKeypointByLabel("left_ear");
        if (leftEar == null) {
            return earlobes;
        }

        const rightEar = this.getKeypointByLabel("right_ear");
        if (rightEar == null) {
            return earlobes;
        }

        const leftEye = this.getKeypointByLabel("left_eye");
        if (leftEye == null) {
            return earlobes;
        }

        const rightEye = this.getKeypointByLabel("right_eye");
        if (rightEye == null) {
            return earlobes;
        }

        const midPointBetweenNoseAndMouth = this.getKeypointByLabel("midpoint_between_nose_and_mouth");
        if (midPointBetweenNoseAndMouth == null) {
            return earlobes;
        }

        const leftEdgeFace = this.getKeypointByLabel("left_edge_face");
        if (leftEdgeFace == null) {
            return earlobes;
        }

        const rightEdgeFace = this.getKeypointByLabel("right_edge_face");
        if (rightEdgeFace == null) {
            return earlobes;
        }

        const topEdgeFace = this.getKeypointByLabel("top_edge_face");
        if (topEdgeFace == null) {
            return earlobes;
        }

        const bottomEdgeFace = this.getKeypointByLabel("bottom_edge_face");
        if (bottomEdgeFace == null) {
            return earlobes;
        }

        /*
         * Determine which algorithm to use, based on head rotation.
         *
         * None
         *      Use the original algorithm.
         *
         *      todo Test whether clamping to the edge of the face produces better results.
         *
         * Left/Right
         *      Use the original algorithm, but hide earlobes depending on head rotation
         *
         *      The magic numbers, used in the two comparisons, were arbitrarily chosen, but seem to work.
         *
         * Up/Down
         *     Use the original algorithm, but add an offset to the earlobe Y-Axis coordinates depending on head
         *     rotation.
         *
         *     The magic numbers, used in the two comparisons, were arbitrarily chosen, but seem to work.
         */
        const isRotatedLeft = (rightEdgeFace.z - leftEdgeFace.z) > 20;
        const isRotatedRight = (leftEdgeFace.z - rightEdgeFace.z) > 20;

        const isRotatedUp = topEdgeFace.z > 8;
        const isRotatedDown = bottomEdgeFace.z > 8;

        /*
         * We assume that the Y-Axis of each earlobe is the same as the midpoint between the nose and mouth.
         *
         * The Y-Axis coordinates are affected by head tilt, which can be determined either by the difference between
         * the Y-Axis coordinates of the ears or eyes. Generally, Keypoints closer to the middle of the face are more
         * accurate, so we use the difference between the Y-Axis coordinates of the eyes.
         */
        let leftEarlobeY = midPointBetweenNoseAndMouth.y + (leftEye.y - rightEye.y);
        let rightEarlobeY = midPointBetweenNoseAndMouth.y + (rightEye.y - leftEye.y);

        // If the head is tilted up or down, we need to apply an offset to negate the tilt.
        leftEarlobeY += isRotatedUp ? topEdgeFace.z: 0;
        leftEarlobeY += isRotatedDown ? -bottomEdgeFace.z : 0;

        rightEarlobeY += isRotatedUp ? topEdgeFace.z : 0;
        rightEarlobeY += isRotatedDown ? -bottomEdgeFace.z : 0;

        /*
         * As the ear Keypoints are not as reliable as Keypoints closer to the middle of the face, we adjust the X-Axis
         * coordinates of the earlobes to be closer to edges of the face.
         */
        const leftEarlobeX = leftEar.x + ((leftEdgeFace.x - leftEar.x) / 2);
        const rightEarlobeX = rightEar.x - ((rightEar.x - rightEdgeFace.x) / 2);

        /*
         * We assume that the X-Axis coordinate of the earlobe is the same as the X-Axis coordinate of the ear.
         *
         * We assume that head rotation is accounted for by the ear Keypoints, as their coordinates are updated by the
         * model.
         */
        const leftEarlobeKeypoint = new Keypoint(
            leftEarlobeX + this.leftEarlobeOffsets[0],
            leftEarlobeY + this.leftEarlobeOffsets[1],
            leftEar.z + this.leftEarlobeOffsets[2],
            1,
            "left_earlobe"
        );

        const rightEarlobeKeypoint = new Keypoint(
            rightEarlobeX + this.rightEarlobeOffsets[0],
            rightEarlobeY + this.rightEarlobeOffsets[1],
            rightEar.z + this.rightEarlobeOffsets[2],
            1,
            "right_earlobe"
        );

        if (!isRotatedLeft && !isRotatedRight) {
            return [leftEarlobeKeypoint, rightEarlobeKeypoint];
        } else {
            return [
                isRotatedLeft ? leftEarlobeKeypoint : null,
                isRotatedRight ? rightEarlobeKeypoint : null
            ];
        }
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
     * Sets the offsets of the left earlobe Keypoint.
     *
     * @param {number} xOffset Offset to apply to the X coordinate.
     * @param {number} yOffset Offset to apply to the Y coordinate.
     * @param {number} zOffset Offset to apply to the Z coordinate.
     */
    setLeftEarlobeOffsets(xOffset = 0, yOffset = 0, zOffset = 0) {
        validateNumber(xOffset);
        validateNumber(yOffset);
        validateNumber(zOffset);

        this.leftEarlobeOffsets = [xOffset, yOffset, zOffset];
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

    /**
     * Sets the offsets of the right earlobe Keypoint.
     *
     * @param {number} xOffset Offset to apply to the X coordinate.
     * @param {number} yOffset Offset to apply to the Y coordinate.
     * @param {number} zOffset Offset to apply to the Z coordinate.
     */
    setRightEarlobeOffsets(xOffset = 0, yOffset = 0, zOffset = 0) {
        validateNumber(xOffset);
        validateNumber(yOffset);
        validateNumber(zOffset);

        this.rightEarlobeOffsets = [xOffset, yOffset, zOffset];
    }
}