import {Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader} from "three";
import {validateDefined, validateNonEmptyString, validateNumber, validateString} from "./validation.js";

export class Keypoint {
    /** @type {string} Default colour to use when displaying Keypoints. */
    static defaultColour = "#FFFFFF"

    /** @type {number} Default width and height to use when displaying Keypoints. */
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

        this.assetHeight = null;
        this.assetWidth = null;
        this.setColour(Keypoint.defaultColour)
        this.setConfidence(confidence);
        this.setLabel(label);
        this.setPosition(x, y, z);
        this.setSize(Keypoint.defaultSize);
    }

    /**
     * Copies the properties of a raw Keypoint object into this Keypoint.
     *
     * @param {object} rawKeypoint Raw Keypoint object to copy.
     */
    copyRawKeypoint(rawKeypoint) {
        validateDefined(rawKeypoint);

        this.setConfidence(rawKeypoint.hasOwnProperty("score") ? rawKeypoint.score : 1);
        this.setLabel(rawKeypoint.hasOwnProperty("name") ? rawKeypoint.name : "");
        this.setX(rawKeypoint.hasOwnProperty("x") ? rawKeypoint.x : 0);
        this.setY(rawKeypoint.hasOwnProperty("y") ? rawKeypoint.y : 0);
        this.setZ(rawKeypoint.hasOwnProperty("z") ? rawKeypoint.z : 0);
    }

    /**
     * Converts degrees to radians.
     *
     * @param {number} degrees A degree value.
     * @returns {number} The equivalent value in radians.
     */
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Retrieves the original height, in pixels, of the asset displayed on the Keypoint.
     *
     * @returns {number|null} The height, or null if the Keypoint is not displaying an asset.
     */
    getAssetHeight() {
        return this.assetHeight;
    }

    /**
     * Retrieves the original width, in pixels, of the asset displayed on the Keypoint.
     *
     * @returns {number|null} The width, or null if the Keypoint is not displaying an asset.
     */
    getAssetWidth() {
        return this.assetWidth;
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
     * Retrieve the Keypoint's height with scaling applied, in pixels.
     *
     * @returns {number} Keypoint's height.
     */
    getHeight() {
        return this.height * this.mesh.scale.y;
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
     * Retrieve the Keypoint's height with scaling applied, in pixels.
     *
     * @returns {number} Keypoint's height.
     */
    getWidth() {
        return this.width * this.mesh.scale.x;
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
     * Display a 2D asset on the Keypoint.
     *
     * @param url URL of the asset to display.
     * @param afterLoadCallback Callback to execute after the asset has been loaded.
     */
    display2DAsset(url, afterLoadCallback = null) {
        validateNonEmptyString(url);

        const loader = new TextureLoader();
        loader.load(
            url,
            (texture) => {
                this.assetHeight = texture.image.height;
                this.assetWidth = texture.image.width;

                this.setHeight(texture.image.height);
                this.setWidth(texture.image.width);

                this.mesh.material = new MeshBasicMaterial({ map: texture, transparent: true });

                afterLoadCallback?.();
            },
            null,
            (error) => {
                console.error("Error loading texture from URL: " + url, error);
            }
        );
    }

    /**
     * Translate the Keypoint's position on all axes.
     *
     * @param {number} x Amount to translate the Keypoint's position on the x-axis.
     * @param {number} y Amount to translate the Keypoint's position on the y-axis.
     * @param {number} z Amount to translate the Keypoint's position on the z-axis.
     */
    translatePosition(x, y, z) {
        this.setX(this.getX() + x);
        this.setY(this.getY() + y);
        this.setZ(this.getZ() + z);
    }

    /**
     * Determines whether the Keypoint is displaying a 2D asset.
     *
     * @returns {boolean} Whether the Keypoint is displaying a 2D asset.
     */
    isDisplayingAsset() {
        return this.mesh.material.map != null;
    }

    /**
     * Scale the Keypoint's position on all axes.
     *
     * @param {number} x Amount to scale the Keypoint's position on the x-axis.
     * @param {number} y Amount to scale the Keypoint's position on the y-axis.
     * @param {number} z Amount to scale the Keypoint's position on the z-axis.
     */
    scalePosition(x, y, z) {
        this.setX(this.getX() * x);
        this.setY(this.getY() * y);
        this.setZ(this.getZ() * z);
    }

    /**
     * Set the Keypoint's colour.
     *
     * If the Keypoint is displaying a 2D asset, this will not change the colour of the asset.
     *
     * @param colour New colour of the Keypoint.
     */
    setColour(colour) {
        validateNonEmptyString(colour);
        this.colour = colour;

        if (this.mesh.material.map == null) {
            this.mesh.material.color.set(colour);
        }
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
     * Set the Keypoint's height.
     *
     * @param height New height of the Keypoint.
     */
    setHeight(height) {
        validateNumber(height);
        this.height = height;
        this.mesh.geometry = new PlaneGeometry(this.width, height);
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
     * Set the Keypoint's rotation on the all axes.
     *
     * @param {number} x New rotation of the Keypoint on the x-axis, in degrees.
     * @param {number} y New rotation of the Keypoint on the y-axis, in degrees.
     * @param {number} z New rotation of the Keypoint on the z-axis, in degrees.
     */
    setRotation(x, y, z) {
        this.setRotationX(x);
        this.setRotationY(y);
        this.setRotationZ(z);
    }

    /**
     * Set the Keypoint's rotation on the x-axis.
     *
     * @param {number} x New rotation of the Keypoint on the x-axis, in degrees.
     */
    setRotationX(x) {
        validateNumber(x);
        this.mesh.rotation.x = this.degreesToRadians(x);
    }

    /**
     * Set the Keypoint's rotation on the y-axis.
     *
     * @param {number} y New rotation of the Keypoint on the y-axis, in degrees.
     */
    setRotationY(y) {
        validateNumber(y);
        this.mesh.rotation.y = this.degreesToRadians(y);
    }

    /**
     * Set the Keypoint's rotation on the z-axis.
     *
     * @param {number} z New rotation of the Keypoint on the z-axis, in degrees.
     */
    setRotationZ(z) {
        validateNumber(z);
        this.mesh.rotation.z = this.degreesToRadians(z);
    }

    /**
     * Set the Keypoint's scale on all axes.
     *
     * @param {number} x New scale of the Keypoint on the x-axis.
     * @param {number} y New scale of the Keypoint on the y-axis.
     * @param {number} z New scale of the Keypoint on the z-axis.
     */
    setScale(x, y, z) {
        this.setScaleX(x);
        this.setScaleY(y);
        this.setScaleZ(z);
    }

    /**
     * Set the Keypoint's scale on the x-axis.
     *
     * @param {number} x New scale of the Keypoint on the x-axis.
     */
    setScaleX(x) {
        validateNumber(x);
        this.mesh.scale.x = x;
    }

    /**
     * Set the Keypoint's scale on the y-axis.
     *
     * @param {number} y New scale of the Keypoint on the y-axis.
     */
    setScaleY(y) {
        validateNumber(y);
        this.mesh.scale.y = y;
    }

    /**
     * Set the Keypoint's scale on the z-axis.
     *
     * @param {number} z New scale of the Keypoint on the z-axis.
     */
    setScaleZ(z) {
        validateNumber(z);
        this.mesh.scale.z = z;
    }

    /**
     * Set the Keypoint's width and height.
     *
     * @param size New width and height of the Keypoint.
     */
    setSize(size) {
        validateNumber(size);
        this.setHeight(size);
        this.setWidth(size);
    }

    /**
     * Set the Keypoint's width.
     *
     * @param width New width of the Keypoint.
     */
    setWidth(width) {
        validateNumber(width);
        this.width = width;
        this.mesh.geometry = new PlaneGeometry(width, this.height);
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