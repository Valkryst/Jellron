import {validateNumber, validateString} from "./validation.js";

export class Keypoint {
    /**
     * Creates a new Keypoint object.
     *
     * @param x Position of the Keypoint on the x-axis.
     * @param y Position of the Keypoint on the y-axis.
     * @param z Position of the Keypoint on the z-axis.
     * @param confidence How confident we are that the Keypoint is accurate.
     * @param label Label of the Keypoint.
     */
    constructor(x, y, z, confidence, label) {
        this.setPosition(x, y, z);
        this.setConfidence(confidence);
        this.setLabel(label);
    }

    /**
     * Retrieve the Keypoint's confidence.
     *
     * @returns {number} Keypoint's confidence.
     */
    getConfidence() {
        return this.confidence;
    }

    /**
     * Retrieve the Keypoint's label.
     *
     * @returns {string}
     */
    getLabel() {
        return this.label;
    }

    /**
     * Retrieve the Keypoint's position on the x-axis.
     *
     * @returns {number} Keypoint's position on the x-axis.
     */
    getX() {
        return this.x;
    }

    /**
     * Retrieve the Keypoint's position on the y-axis.
     *
     * @returns {number} Keypoint's position on the y-axis.
     */
    getY() {
        return this.y;
    }

    /**
     * Retrieve the Keypoint's position on the x-axis.
     *
     * @returns {number} Keypoint's position on the x-axis.
     */
    getZ() {
        return this.z;
    }

    /**
     * Set the Keypoint's confidence.
     *
     * @param confidence New confidence of the Keypoint.
     */
    setConfidence(confidence) {
        validateNumber(confidence);
        this.confidence = confidence;
    }

    /**
     * Set the Keypoint's label.
     *
     * @param label New label of the Keypoint.
     */
    setLabel(label) {
        if (label == null) {
            this.label = label;
            return;
        }

        validateString(label);
        this.label = label;
    }

    /**
     * Set the Keypoint's position on all axes.
     *
     * @param {number} x New position of the Keypoint on the x-axis.
     * @param {number} y New position of the Keypoint on the y-axis.
     * @param {number} z New position of the Keypoint on the z-axis.
     */
    setPosition(x, y, z) {
        this.setX(x);
        this.setY(y);
        this.setZ(z);
    }

    /**
     * Set the Keypoint's position on the x-axis.
     *
     * @param {number} x New position of the Keypoint on the x-axis.
     */
    setX(x) {
        validateNumber(x);
        this.x = x;
    }

    /**
     * Set the Keypoint's position on the y-axis.
     *
     * @param {number} y New position of the Keypoint on the y-axis.
     */
    setY(y) {
        validateNumber(y);
        this.y = y;
    }

    /**
     * Set the Keypoint's position on the z-axis.
     *
     * @param {number} z New position of the Keypoint on the z-axis.
     */
    setZ(z) {
        validateNumber(z);
        this.z = z;
    }
}