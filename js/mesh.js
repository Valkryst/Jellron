import {Keypoint} from "./keypoint.js";
import {validateNonEmptyString, validateNumber} from "./validation.js";

export class Mesh {
    /** @type {string} Default colour to use when displaying body Keypoints. */
    static defaultBodyKeypointColour = "magenta";

    /** @type {string} Default colour to use when displaying choker Keypoints. */
    static defaultChokerKeypointColour = "blue";

    /** @type {string} Default colour to use when displaying earlobe Keypoints. */
    static defaultEarlobeKeypointColour = "yellow";

    /** @type {string} Default colour to use when displaying face Keypoints. */
    static defaultFaceKeypointColour = "green";

    /** @type {string} Default colour to use when displaying hand Keypoints. */
    static defaultHandKeypointColour = "orange";

    /** @type {string} Default colour to use when displaying necklace Keypoints. */
    static defaultNecklaceKeypointColour = "red";

    /** Creates a new Mesh object. */
    constructor() {
        this.bodyKeypoints = [];
        this.chokerKeypoint = new Keypoint(0, 0, 0, 0, "choker");
        this.earlobeKeypoints = [
            new Keypoint(0, 0, 0, 0, "left_earlobe"),
            new Keypoint(0, 0, 0, 0, "right_earlobe")
        ]
        this.faceKeypoints = [];
        this.handKeypoints = [];
        this.necklaceKeypoint = new Keypoint(0, 0, 0, 0, "necklace");

        this.bodyScale = [1, 1, 1];

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

        if (this.faceKeypoints.length === 0) {
            // As far as I can tell, the array of face Keypoints is always the same length, so we can initialise it here.
            for (let i = 0 ; i < rawFace.keypoints.length; i++) {
                const keypoint = new Keypoint(0, 0, 0, 0, "");
                keypoint.setColour(Mesh.defaultFaceKeypointColour);
                keypoint.setSize(3);
                this.faceKeypoints.push(keypoint);
            }
        }

        for (let i = 0 ; i < rawFace.keypoints.length; i++) {
            const keypoint = this.faceKeypoints[i];
            keypoint.copyRawKeypoint(rawFace.keypoints[i]);
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

        if (this.bodyKeypoints.length === 0) {
            // As far as I can tell, the array of body Keypoints is always the same length, so we can initialise it here.
            for (let i = 0 ; i < rawBody.keypoints.length; i++) {
                const keypoint = new Keypoint(0, 0, 0, 0, "");
                keypoint.setColour(Mesh.defaultBodyKeypointColour);
                this.bodyKeypoints.push(keypoint);
            }
        }

        for (let i = 0 ; i < rawBody.keypoints.length; i++) {
            const keypoint = this.bodyKeypoints[i];
            keypoint.copyRawKeypoint(rawBody.keypoints[i]);
            keypoint.scalePosition(...this.bodyScale);
        }
    }

    /**
     *
     * @param {Object[{
     *     score: number,
     *     handedness: string,
     *     keypoints: [{
     *          x: number,
     *          y: number,
     *          name: string
     *     }],
     *     keypoints3D: [{
     *          x: number,
     *          y: number,
     *          z: number,
     *          name: string
     *     }]
     * }]} rawHands
     */
    updateHandKeypoints(rawHands) {
        // todo Check what happens when one or both hands aren't visible.
        if (rawHands == null || rawHands.length === 0) {
            return;
        }

        if (this.handKeypoints.length === 0) {
            // As far as I can tell, the array of hand Keypoints is always the same length, so we can initialise it here.
            for (const rawHand of rawHands) {
                for (let i = 0; i < rawHand.keypoints.length; i++) {
                    const keypoint = new Keypoint(0, 0, 0, 0, "");
                    keypoint.setColour(Mesh.defaultHandKeypointColour);
                    this.handKeypoints.push(keypoint);
                }
            }
        }

        for (const rawHand of rawHands) {
            for (let i = 0; i < rawHand.keypoints.length; i++) {
                const keypoint = this.handKeypoints[i];
                keypoint.copyRawKeypoint(rawHand.keypoints[i]);
            }
        }
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

        if (label === "choker") {
            return this.getChokerKeypoint();
        }

        if (label === "left_earlobe" || label === "right_earlobe") {
            return this.getEarlobeKeypoints()[label === "left_earlobe" ? 0 : 1];
        }

        if (label === "necklace") {
            return this.getNecklaceKeypoint();
        }

        for (const keypoint of this.faceKeypoints) {
            if (keypoint.getLabel() === label) {
                return keypoint;
            }
        }

        for (const keypoint of this.bodyKeypoints) {
            if (keypoint.getLabel() === label) {
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
        labels.push(this.chokerKeypoint.getLabel());
        labels.push(this.earlobeKeypoints[0].getLabel());
        labels.push(this.earlobeKeypoints[1].getLabel());
        labels.push(this.necklaceKeypoint.getLabel());

        for (const keypoint of this.faceKeypoints) {
            if (keypoint.getLabel() != null) {
                labels.push(keypoint.getLabel());
            }
        }

        for (const keypoint of this.bodyKeypoints) {
            if (keypoint.getLabel() != null) {
                labels.push(keypoint.getLabel());
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
        this.chokerKeypoint.setConfidence(0);

        const noseKeypoint = this.getKeypointByLabel("nose");
        if (noseKeypoint == null) {
            return this.chokerKeypoint;
        }

        const necklaceKeypoint = this.getKeypointByLabel("necklace");
        if (necklaceKeypoint == null) {
            return this.chokerKeypoint;
        }

        let x = necklaceKeypoint.getX();
        x += ((noseKeypoint.getX() - necklaceKeypoint.getX()) / 3);
        x += this.chokerOffsets[0];

        let y = necklaceKeypoint.getY();
        y += ((noseKeypoint.getY() - necklaceKeypoint.getY()) / 3);
        y += this.chokerOffsets[1];

        let z = necklaceKeypoint.getZ();
        z += (noseKeypoint.getZ() + necklaceKeypoint.getZ()) / 2;
        z += this.chokerOffsets[2];

        this.chokerKeypoint.setConfidence(1);
        this.chokerKeypoint.setPosition(x, y, z);
        this.chokerKeypoint.setColour(Mesh.defaultChokerKeypointColour);
        return this.chokerKeypoint;
    }

    /**
     * Calculates and retrieves the positions of the earlobe Keypoints.
     *
     * @returns {Keypoint[]} Earlobe Keypoints. Element [0] is the left earlobe, and [1] is the right earlobe. The both Keypoints will be null if either one cannot be calculated.
     */
    getEarlobeKeypoints() {
        this.earlobeKeypoints[0].setConfidence(0);
        this.earlobeKeypoints[1].setConfidence(0);

        const leftEar = this.getKeypointByLabel("left_ear");
        if (leftEar == null) {
            return this.earlobeKeypoints;
        }

        const rightEar = this.getKeypointByLabel("right_ear");
        if (rightEar == null) {
            return this.earlobeKeypoints;
        }

        const leftEye = this.getKeypointByLabel("left_eye");
        if (leftEye == null) {
            return this.earlobeKeypoints;
        }

        const rightEye = this.getKeypointByLabel("right_eye");
        if (rightEye == null) {
            return this.earlobeKeypoints;
        }

        const midPointBetweenNoseAndMouth = this.getKeypointByLabel("midpoint_between_nose_and_mouth");
        if (midPointBetweenNoseAndMouth == null) {
            return this.earlobeKeypoints;
        }

        const leftEdgeFace = this.getKeypointByLabel("left_edge_face");
        if (leftEdgeFace == null) {
            return this.earlobeKeypoints;
        }

        const rightEdgeFace = this.getKeypointByLabel("right_edge_face");
        if (rightEdgeFace == null) {
            return this.earlobeKeypoints;
        }

        const topEdgeFace = this.getKeypointByLabel("top_edge_face");
        if (topEdgeFace == null) {
            return this.earlobeKeypoints;
        }

        const bottomEdgeFace = this.getKeypointByLabel("bottom_edge_face");
        if (bottomEdgeFace == null) {
            return this.earlobeKeypoints;
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
        const leftEarlobeX = leftEar.x + ((leftEdgeFace.x - leftEar.x) / 3);
        const rightEarlobeX = rightEar.x - ((rightEar.x - rightEdgeFace.x) / 3);

        /*
         * We assume that the X-Axis coordinate of the earlobe is the same as the X-Axis coordinate of the ear.
         *
         * We assume that head rotation is accounted for by the ear Keypoints, as their coordinates are updated by the
         * model.
         */
        this.earlobeKeypoints[0].setConfidence(1);
        this.earlobeKeypoints[0].setPosition(leftEarlobeX, leftEarlobeY, leftEar.z);
        this.earlobeKeypoints[0].translatePosition(...this.leftEarlobeOffsets);
        this.earlobeKeypoints[0].setColour(Mesh.defaultEarlobeKeypointColour);

        this.earlobeKeypoints[1].setConfidence(1);
        this.earlobeKeypoints[1].setPosition(rightEarlobeX, rightEarlobeY, rightEar.z);
        this.earlobeKeypoints[1].translatePosition(...this.rightEarlobeOffsets);
        this.earlobeKeypoints[1].setColour(Mesh.defaultEarlobeKeypointColour);

        return this.earlobeKeypoints;
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
     * Retrieves the hand Keypoints.
     *
     * @returns {Keypoint[]} Hand Keypoints.
     */
    getHandKeypoints() {
        return this.handKeypoints;
    }

    /**
     * Calculates and retrieves the position of the necklace Keypoint.
     *
     * @returns {Keypoint|null} Position of the necklace Keypoint, or null if the Keypoint cannot be calculated.
     */
    getNecklaceKeypoint() {
        this.necklaceKeypoint.setConfidence(0);

        const leftShoulder = this.getKeypointByLabel("left_shoulder");
        if (leftShoulder == null) {
            return this.necklaceKeypoint;
        }

        const rightShoulder = this.getKeypointByLabel("right_shoulder");
        if (rightShoulder == null) {
            return this.necklaceKeypoint;
        }

        // todo 200 is a magic number, and may break with different cameras.
        const scale = Math.abs(leftShoulder.x - rightShoulder.x) / 200;
        this.necklaceKeypoint.setScale(scale, scale, 1);

        const rotationZ = (rightShoulder.y - leftShoulder.y) / 5;
        this.necklaceKeypoint.setRotationZ(rotationZ);

        let x = (leftShoulder.x + rightShoulder.x) / 2;
        x += this.necklaceOffsets[0];

        let y = (leftShoulder.y + rightShoulder.y) / 2;
        y += this.necklaceOffsets[1];

        let z = (leftShoulder.z + rightShoulder.z) / 2;
        z += this.necklaceOffsets[2];

        this.necklaceKeypoint.setConfidence(1);
        this.necklaceKeypoint.setPosition(x, y, z);
        this.necklaceKeypoint.setColour(Mesh.defaultNecklaceKeypointColour);
        return this.necklaceKeypoint;
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

    /**
     * Sets the scale of the body Keypoints.
     *
     * @param {number} scaleX A factor to scale the X coordinate by.
     * @param {number} scaleY A factor to scale the Y coordinate by.
     * @param {number} scaleZ A factor to scale the Z coordinate by.
     */
    setBodyScale(scaleX = 1, scaleY = 1, scaleZ = 1) {
        this.bodyScale = [scaleX, scaleY, scaleZ];
    }
}