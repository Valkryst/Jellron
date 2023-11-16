import {Keypoint} from "./keypoint.js";
import {Mesh} from "./mesh.js";
import {
    validateBoolean,
    validateInstanceOf,
    validateNonEmptyString,
    validateNumber,
    validatePositiveNumber
} from "./validation.js";

export class MeshRenderer {
    constructor() {
        this.displayBody = true;
        this.displayChoker = true;
        this.displayEarlobes = true;
        this.displayFace = true;
        this.displayNecklace = true;

        this.defaultKeypointSize = 5;
        this.bodyKeypointSize = this.defaultKeypointSize;
        this.faceKeypointSize = 2;

        this.bodyKeypointColour = "magenta";
        this.chokerKeypointColour = "blue";
        this.earlobeKeypointColour = "yellow";
        this.faceKeypointColour = "green";
        this.necklaceKeypointColour = "red";

        this.intervalId = null;
        this.lastRuntime = 0;

        this.minimumConfidence = 0.5;
    }

    /**
     * Starts the renderer.
     *
     * @param drawsPerSecond Desired number of draws per second.
     * @param canvasContext Canvas context to draw on.
     * @param mesh Mesh to draw.
     */
    start(drawsPerSecond, canvasContext, mesh) {
        validateNumber(drawsPerSecond);
        validateInstanceOf(canvasContext, CanvasRenderingContext2D);
        validateInstanceOf(mesh, Mesh);

        if (this.intervalId != null) {
            this.stop();
        }

        this.intervalId = setInterval(() => {
            const currentTime = performance.now();

            canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);

            if (this.displayFace) {
                this.drawFace(canvasContext, mesh);
            }

            if (this.displayBody) {
                this.drawBody(canvasContext, mesh);
            }

            if (this.displayChoker) {
                const chokerKeyPoint = mesh.getChokerKeypoint();
                if (chokerKeyPoint != null) {
                    canvasContext.fillStyle = this.chokerKeypointColour;
                    this.drawPoint(
                        canvasContext,
                        chokerKeyPoint,
                        this.defaultKeypointSize
                    );
                }
            }

            if (this.displayNecklace) {
                const necklaceKeypoint = mesh.getNecklaceKeypoint();
                if (necklaceKeypoint != null) {
                    canvasContext.fillStyle = this.necklaceKeypointColour;
                    this.drawPoint(
                        canvasContext,
                        necklaceKeypoint,
                        this.defaultKeypointSize
                    );
                }
            }

            if (this.displayEarlobes) {
                canvasContext.fillStyle = this.earlobeKeypointColour;
                for (const keypoint of mesh.getEarlobeKeypoints()) {
                    if (keypoint == null) {
                        continue;
                    }

                    this.drawPoint(
                        canvasContext,
                        keypoint,
                        this.defaultKeypointSize
                    );
                }
            }

            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / drawsPerSecond);
    }

    /** Stops the renderer. */
    stop() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Draws the body of a Mesh on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     * @param mesh Mesh whose body to draw.
     */
    drawBody(canvasContext, mesh) {
        validateInstanceOf(canvasContext, CanvasRenderingContext2D);
        validateInstanceOf(mesh, Mesh);

        canvasContext.fillStyle = this.bodyKeypointColour;
        for (const keypoint of mesh.getBodyKeypoints()) {
            this.drawPoint(canvasContext, keypoint, this.bodyKeypointSize);
        }
    }

    /**
     * Draws the face of a Mesh on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     * @param mesh Mesh whose face to draw.
     */
    drawFace(canvasContext, mesh) {
        validateInstanceOf(canvasContext, CanvasRenderingContext2D);
        validateInstanceOf(mesh, Mesh);

        canvasContext.fillStyle = this.faceKeypointColour;
        for (const keypoint of mesh.getFaceKeypoints()) {
            this.drawPoint(canvasContext, keypoint, this.faceKeypointSize);
        }
    }

    /**
     * Draws a Keypoint on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     * @param keypoint Keypoint to draw.
     * @param size Size of the Keypoint rectangle, in pixels.
     */
    drawPoint(canvasContext, keypoint, size) {
        validateInstanceOf(canvasContext, CanvasRenderingContext2D);
        validateInstanceOf(keypoint, Keypoint);
        validatePositiveNumber(size);

        if (keypoint.confidence < this.minimumConfidence) {
            return;
        }

        const halfSize = size / 2;
        canvasContext.fillRect(keypoint.x - halfSize, keypoint.y - halfSize, size, size);
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
     * @param displayBody Whether the face should be displayed.
     */
    setDisplayBody(displayBody) {
        validateBoolean(displayBody);
        this.displayBody = displayBody;
    }

    /**
     * Sets whether the choker should be displayed.
     *
     * @param displayChoker Whether the choker should be displayed.
     */
    setDisplayChoker(displayChoker) {
        validateBoolean(displayChoker);
        this.displayChoker = displayChoker;
    }

    /**
     * Sets whether the earlobes should be displayed.
     *
     * @param displayEarlobes Whether the earlobes should be displayed.
     */
    setDisplayEarlobes(displayEarlobes) {
        validateBoolean(displayEarlobes);
        this.displayEarlobes = displayEarlobes;
    }

    /**
     * Sets whether the face should be displayed.
     *
     * @param displayFace Whether the face should be displayed.
     */
    setDisplayFace(displayFace) {
        validateBoolean(displayFace);
        this.displayFace = displayFace;
    }

    /**
     * Sets whether the necklace should be displayed.
     *
     * @param displayNecklace Whether the necklace should be displayed.
     */
    setDisplayNecklace(displayNecklace) {
        validateBoolean(displayNecklace)
        this.displayNecklace = displayNecklace;
    }

    /**
     * Sets the colour of the choker Keypoint.
     *
     * @param {string} colour Colour of the choker Keypoint.
     */
    setChokerKeypointColour(colour) {
        validateNonEmptyString(colour);
        this.chokerKeypointColour = colour;
    }

    /**
     * Sets the colour of the earlobe Keypoints.
     *
     * @param colour Colour of the earlobe Keypoints.
     */
    setEarlobeKeypointColour(colour) {
        validateNonEmptyString(colour);
        this.earlobeKeypointColour = colour;
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
     * Sets the colour of the necklace Keypoint.
     *
     * @param {string} colour Colour of the necklace Keypoint.
     */
    setNecklaceKeypointColour(colour) {
        validateNonEmptyString(colour);
        this.necklaceKeypointColour = colour;
    }

    /**
     * Sets the colour of the body Keypoints.
     *
     * @param {string} colour Colour of the body Keypoints.
     */
    setBodyKeypointColour(colour) {
        validateNonEmptyString(colour);
        this.bodyKeypointColour = colour;
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
        this.bodyKeypointSize = size;
    }
}