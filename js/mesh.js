import {Keypoint} from "./keypoint.js";
import {validateNonEmptyString} from "./utility/validation.js";

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
        if (rawFace == null || rawFace.keypoints == null || rawFace.length === 0 || rawFace.keypoints.length === 0) {
            for (let i = 0 ; i < this.faceKeypoints.length; i++) {
                this.faceKeypoints[i].setConfidence(0);
            }
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
        if (rawBody == null || rawBody.keypoints == null || rawBody.length === 0 || rawBody.keypoints.length === 0) {
            for (let i = 0 ; i < this.bodyKeypoints.length; i++) {
                this.bodyKeypoints[i].setConfidence(0);
            }
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
        if (rawHands == null || rawHands.length === 0) {
            for (const keypoint of this.handKeypoints) {
                keypoint.setConfidence(0);
            }
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

        let y = necklaceKeypoint.getY();
        y += ((noseKeypoint.getY() - necklaceKeypoint.getY()) / 3);

        let z = necklaceKeypoint.getZ();
        z += (noseKeypoint.getZ() + necklaceKeypoint.getZ()) / 2;

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

        const leftShoulder = this.getKeypointByLabel("left_shoulder");
        if (leftShoulder == null) {
            return this.earlobeKeypoints;
        }

        const rightShoulder = this.getKeypointByLabel("right_shoulder");
        if (rightShoulder == null) {
            return this.earlobeKeypoints;
        }

        const k93 = this.faceKeypoints?.[93];
        if (k93 == null) {
            return this.earlobeKeypoints;
        }

        const k132 = this.faceKeypoints?.[132];
        if (k132 == null) {
            return this.earlobeKeypoints;
        }

        const k137 = this.faceKeypoints?.[137];
        if (k137 == null) {
            return this.earlobeKeypoints;
        }

        const k177 = this.faceKeypoints?.[177];
        if (k177 == null) {
            return this.earlobeKeypoints;
        }

        const k323 = this.faceKeypoints?.[323];
        if (k323 == null) {
            return this.earlobeKeypoints;
        }

        const k361 = this.faceKeypoints?.[361];
        if (k361 == null) {
            return this.earlobeKeypoints;
        }

        const k366 = this.faceKeypoints?.[366];
        if (k366 == null) {
            return this.earlobeKeypoints;
        }

        const k401 = this.faceKeypoints?.[401];
        if (k401 == null) {
            return this.earlobeKeypoints;
        }

        /**
         * If an earring asset is being displayed on the an earlobe, we need to ensure that it is scaled correctly as
         * the user moves towards or away from the camera.
         *
         * todo The assumption of the necklace being 1/25th the width of the distance between the shoulders is probably
         *      not correct for all assets. We need a better solution, one which may take into account the physical
         *      size (i.e. milli/centimetres) of the asset.
         *      Additionally, because most other points will rapidly change distance with one another, compared to using,
         *      the soulder points, they are not a good reference point for scaling.
         */
        for (const earlobeKeypoint of this.earlobeKeypoints) {
            if (!earlobeKeypoint.isDisplayingAsset()) {
                continue;
            }

            const assetHeight = earlobeKeypoint.getAssetHeight();
            const assetWidth = earlobeKeypoint.getAssetWidth();

            const width = Math.abs(leftShoulder.getX() - rightShoulder.getX()) / 25;
            const height = width / (assetWidth / assetHeight);

            const scaleX = width / assetWidth;
            const scaleY = height / assetHeight;
            earlobeKeypoint.setScale(scaleX, scaleY, 1);
        }

        const isRotatedLeft = (rightEdgeFace.z - leftEdgeFace.z) > 40;
        const isRotatedRight = (leftEdgeFace.z - rightEdgeFace.z) > 40;

        const isRotatedUp = topEdgeFace.z > 8;
        const isRotatedDown = bottomEdgeFace.z > 8;

        let leftEarlobeX;
        leftEarlobeX = k323.getX() + Math.abs(k366.getX() - k323.getX());
        leftEarlobeX += k361.getX() + Math.abs(k401.getX() - k361.getX());
        leftEarlobeX /= 2;
        leftEarlobeX -= this.earlobeKeypoints[0].getWidth() / 2;

        let rightEarlobeX;
        rightEarlobeX = k132.getX() - Math.abs(k132.getX() - k177.getX());
        rightEarlobeX += k93.getX() - Math.abs(k93.getX() - k137.getX());
        rightEarlobeX /= 2;
        rightEarlobeX += this.earlobeKeypoints[1].getWidth() / 2;

        let leftEarlobeY = 0;
        leftEarlobeY = k323.getY() + Math.abs(k366.getY() - k323.getY());
        leftEarlobeY += k361.getY() + Math.abs(k401.getY() - k361.getY());
        leftEarlobeY /= 2;
        leftEarlobeY += this.earlobeKeypoints[0].getHeight() / 2;

        let rightEarlobeY;
        rightEarlobeY = k132.getY() - Math.abs(k132.getY() - k177.getY());
        rightEarlobeY += k93.getY() - Math.abs(k93.getY() - k137.getY());
        rightEarlobeY /= 2;
        rightEarlobeY += this.earlobeKeypoints[1].getHeight() / 2;

        this.earlobeKeypoints[0].setConfidence(isRotatedRight ? 0 : 1);
        this.earlobeKeypoints[0].setPosition(leftEarlobeX, leftEarlobeY, leftEar.z);
        this.earlobeKeypoints[0].setColour(Mesh.defaultEarlobeKeypointColour);

        this.earlobeKeypoints[1].setConfidence(isRotatedLeft ? 0 : 1);
        this.earlobeKeypoints[1].setPosition(rightEarlobeX, rightEarlobeY, rightEar.z);
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

        const leftEdgeFace = this.getKeypointByLabel("left_edge_face");
        if (leftEdgeFace == null) {
            return this.necklaceKeypoint;
        }

        const rightEdgeFace = this.getKeypointByLabel("right_edge_face");
        if (rightEdgeFace == null) {
            return this.necklaceKeypoint;
        }

        const leftShoulder = this.getKeypointByLabel("left_shoulder");
        if (leftShoulder == null) {
            return this.necklaceKeypoint;
        }

        const rightShoulder = this.getKeypointByLabel("right_shoulder");
        if (rightShoulder == null) {
            return this.necklaceKeypoint;
        }

        const bottomEdgeFace = this.getKeypointByLabel("bottom_edge_face");
        if (bottomEdgeFace == null) {
            return this.necklaceKeypoint;
        }

        /*
         * If a necklace asset is being displayed, we need to ensure that it is scaled correctly as the user moves
         * towards or away from the camera.
         *
         * todo The assumption of the necklace being half the width of the distance between the shoulders is probably
         *      not correct for all assets. We need a better solution, one which may take into account the physical
         *      size (i.e. milli/centimetres) of the asset.
         */
        if (this.necklaceKeypoint.isDisplayingAsset()) {
            const assetHeight = this.necklaceKeypoint.getAssetHeight();
            const assetWidth = this.necklaceKeypoint.getAssetWidth();

            const width = Math.abs(leftShoulder.getX() - rightShoulder.getX()) / 2;
            const height = width / (assetWidth / assetHeight);

            const scaleX = width / assetWidth;
            const scaleY = height / assetHeight;
            this.necklaceKeypoint.setScale(scaleX, scaleY, 1);
        }

        const rotationY  = (rightEdgeFace.z - leftEdgeFace.z) / 3;
        this.necklaceKeypoint.setRotationY(-rotationY);

        const rotationZ = (rightShoulder.getY() - leftShoulder.getY()) / 5;
        this.necklaceKeypoint.setRotationZ(rotationZ);

        let x = (leftShoulder.getX() + rightShoulder.getX()) / 2;

        /*
         * todo We add an offset, based on the bottom edge of the user's face, to ensure the demo necklace asset appears
         *      in a more correct position. However, this will likely break with other assets and it does break if the
         *      user raises their chin too high. We need a better solution.
         */
        let y = (leftShoulder.getY() + rightShoulder.getY()) / 2;
        y += (bottomEdgeFace.getY() - y) / 3;

        let z = (leftShoulder.getZ() + rightShoulder.getZ()) / 2;

        this.necklaceKeypoint.setConfidence(1);
        this.necklaceKeypoint.setPosition(x, y, z);
        this.necklaceKeypoint.setColour(Mesh.defaultNecklaceKeypointColour);
        return this.necklaceKeypoint;
    }
}