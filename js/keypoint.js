import {Mesh, MeshBasicMaterial, PlaneGeometry, Scene} from "three";
import {validateNonEmptyString, validateNumber, validateString} from "./validation.js";

export class Keypoint {
    /** @type {string} Default colour to use when displaying Keypoints. */
    static defaultColour = "#FFFFFF"

    /** @type {number} Default size to use when displaying Keypoints. */
    static defaultSize = 5;

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
        this.mesh = new Mesh(
            new PlaneGeometry(Keypoint.defaultSize, Keypoint.defaultSize),
            new MeshBasicMaterial({ color: Keypoint.defaultColour })
        );

        this.setColour(Keypoint.defaultColour)
        this.setConfidence(confidence);
        this.setLabel(label);
        this.setPosition(x, y, z);
        this.setSize(Keypoint.defaultSize);
    }

    /**
     * Retrieve the Keypoint's colour.
     *
     * @returns {string} Keypoint's colour.
     */
    getColour() {
        return this.colour;
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
     * Retrieve the Keypoint's mesh.
     *
     * @returns {Mesh} Keypoint's mesh.
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Retrieve the Keypoint's size.
     *
     * @returns {number} Keypoint's size.
     */
    getSize() {
        return this.size;
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
     * Set the Keypoint's colour.
     *
     * @param colour New colour of the Keypoint.
     */
    setColour(colour) {
        validateNonEmptyString(colour);
        this.colour = colour;
        this.mesh.material.color.set(colour);
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
     * Set the Keypoint's size.
     *
     * @param size New size of the Keypoint.
     */
    setSize(size) {
        validateNumber(size);
        this.size = size;
        this.mesh.geometry = new PlaneGeometry(size, size);
    }

    /**
     * Set the Keypoint's position on the x-axis.
     *
     * @param {number} x New position of the Keypoint on the x-axis.
     */
    setX(x) {
        validateNumber(x);
        this.x = x;
        this.mesh.position.x = x;
    }

    /**
     * Set the Keypoint's position on the y-axis.
     *
     * @param {number} y New position of the Keypoint on the y-axis.
     */
    setY(y) {
        validateNumber(y);
        this.y = y;

        // We invert the Y-Axis, because Three.js uses a different coordinate system than our TensorFlow models.
        this.mesh.position.y = -y;
    }

    /**
     * Set the Keypoint's position on the z-axis.
     *
     * @param {number} z New position of the Keypoint on the z-axis.
     */
    setZ(z) {
        validateNumber(z);
        this.z = z;

        // We invert the Z-Axis, because Three.js uses a different coordinate system than our TensorFlow models.
        this.mesh.position.z = -z;
    }
}