import {Keypoint} from "./keypoint.js";
import {Mesh} from "./mesh.js";
import {Renderer} from "./renderer/renderer.js";
import {Scene} from "three";
import {
    validateBoolean,
    validateInstanceOf, validateNonEmptyString,
    validatePositiveNumber
} from "./validation.js";

export class MeshRenderer extends Renderer {
    /** Desired number of frames per second. */
    static fps = 60;

    /**
     * Constructs a new MeshRenderer.
     *
     * @param {Mesh} mesh Mesh to render.
     */
    constructor(mesh) {
        super(document.getElementById("jellron-keypoint-canvas"));

        validateInstanceOf(mesh, Mesh);

        this.mesh = mesh;

        this.displayBody = true;
        this.displayChoker = true;
        this.displayEarlobes = true;
        this.displayFace = true;
        this.displayHands = true;
        this.displayNecklace = true;

        this.intervalId = null;
        this.lastRuntime = 0;

        this.minimumConfidence = 0.5;
    }

    /** @type RunnableInterval["start"] */
    start() {
        if (this.intervalId != null) {
            throw new Error("Already running.");
        }

        const scene = new Scene();

        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            for (const keypoint of this.mesh.getBodyKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayBody) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            for (const keypoint of this.mesh.getFaceKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayFace) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            for (const keypoint of this.mesh.getHandKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayHands) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            const chokerKeyPoint = this.mesh.getChokerKeypoint();
            if (chokerKeyPoint != null) {
                if (this.displayChoker) {
                    this.placePoint(scene, chokerKeyPoint);
                } else {
                    scene.remove(chokerKeyPoint.getMesh());
                }
            }

            const necklaceKeypoint = this.mesh.getNecklaceKeypoint();
            if (necklaceKeypoint != null) {
                if (this.displayNecklace) {
                    this.placePoint(scene, necklaceKeypoint);
                } else {
                    scene.remove(necklaceKeypoint.getMesh());
                }
            }

            for (const keypoint of this.mesh.getEarlobeKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayEarlobes) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            this.glContext.render(scene, this.getCamera());

            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / MeshRenderer.fps);
    }

    /** Stops the renderer. */
    stop() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Displays a 2D necklace on the necklace Keypoint.
     *
     * @param {string} url URL of the necklace image to display.
     */
    display2DNecklace( url) {
        validateNonEmptyString(url);

        this.mesh.getNecklaceKeypoint().display2DAsset(url);
    }

    /**
     * Displays a 2D earring on an earlobe Keypoint.
     *
     * @param url URL of the earring image to display.
     * @param isLeft Whether the earring is for the left ear. If false, it is for the right ear.
     */
    display2DEarring(url, isLeft) {
        validateNonEmptyString(url);
        validateBoolean(isLeft);

        this.mesh.getEarlobeKeypoints()[isLeft ? 0 : 1].display2DAsset(url);
    }

    /**
     * Places a Keypoint within a Scene.
     *
     * @param {Scene} scene Scene to place the keypoint in.
     * @param {Keypoint} keypoint Keypoint to draw.
     */
    placePoint(scene, keypoint) {
        validateInstanceOf(scene, Scene);
        validateInstanceOf(keypoint, Keypoint);

        if (keypoint.getConfidence() < this.minimumConfidence) {
            scene.remove(keypoint.getMesh());
        } else {
            scene.add(keypoint.getMesh());
        }
    }

    /**
     * Retrieves the most recent runtime of the renderer, in milliseconds.
     *
     * @returns {number} Most recent runtime of the renderer, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }

    /**
     * Sets whether the face should be displayed.
     *
     * @param {boolean} displayBody Whether the face should be displayed.
     */
    setDisplayBody(displayBody) {
        validateBoolean(displayBody);
        this.displayBody = displayBody;
    }

    /**
     * Sets whether the choker should be displayed.
     *
     * @param {boolean} displayChoker Whether the choker should be displayed.
     */
    setDisplayChoker(displayChoker) {
        validateBoolean(displayChoker);
        this.displayChoker = displayChoker;
    }

    /**
     * Sets whether the earlobes should be displayed.
     *
     * @param {boolean} displayEarlobes Whether the earlobes should be displayed.
     */
    setDisplayEarlobes(displayEarlobes) {
        validateBoolean(displayEarlobes);
        this.displayEarlobes = displayEarlobes;
    }

    /**
     * Sets whether the face should be displayed.
     *
     * @param {boolean} displayFace Whether the face should be displayed.
     */
    setDisplayFace(displayFace) {
        validateBoolean(displayFace);
        this.displayFace = displayFace;
    }

    /**
     * Sets whether the hands should be displayed.
     *
     * @param {boolean} displayHands Whether the hands should be displayed.
     */
    setDisplayHands(displayHands) {
        validateBoolean(displayHands);
        this.displayHands = displayHands;
    }

    /**
     * Sets whether the necklace should be displayed.
     *
     * @param {boolean} displayNecklace Whether the necklace should be displayed.
     */
    setDisplayNecklace(displayNecklace) {
        validateBoolean(displayNecklace)
        this.displayNecklace = displayNecklace;
    }

    /**
     * Updates the size of the canvas.
     *
     * @param {number} width New width of the canvas.
     * @param {number} height New height of the canvas.
     */
    setSize(width, height) {
        validatePositiveNumber(width);
        validatePositiveNumber(height);
        this.glContext.setSize(width, height, false);
    }
}