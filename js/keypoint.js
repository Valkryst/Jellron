import {validateNonEmptyString, validateNumber} from "./validation.js";

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
        this.update(x, y, z, confidence, label);
    }

    /**
     * Updates the Keypoint.
     *
     * @param x Position of the Keypoint on the x-axis.
     * @param y Position of the Keypoint on the y-axis.
     * @param z Position of the Keypoint on the z-axis.
     * @param confidence How confident we are that the Keypoint is accurate.
     * @param label Label of the Keypoint.
     */
    update(x, y, z, confidence, label) {
        validateNumber(x);
        validateNumber(y);

        if (z != null) {
            validateNumber(z);
        }

        validateNumber(confidence);

        if (label != null) {
            validateNonEmptyString(label);
        }

        this.x = x;
        this.y = y;
        this.z = z;
        this.confidence = confidence;
        this.label = label;
    }
}