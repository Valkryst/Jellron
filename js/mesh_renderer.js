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
        this.displayChoker = true;
        this.displayNecklace = true;

        this.faceKeypointSize = 2;
        this.bodyKeypointSize = 4;

        this.faceKeypointColour = "green";
        this.bodyKeypointColour = "magenta";

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

            this.drawFace(canvasContext, mesh);
            this.drawBody(canvasContext, mesh);

            if (this.displayChoker) {
                const chokerKeyPoint = mesh.getChokerKeypoint();
                if (chokerKeyPoint != null) {
                    canvasContext.fillStyle = "blue";
                    this.drawPoint(
                        canvasContext,
                        chokerKeyPoint,
                        4
                    );
                }
            }

            if (this.displayNecklace) {
                const necklaceKeypoint = mesh.getNecklaceKeypoint();
                if (necklaceKeypoint != null) {
                    canvasContext.fillStyle = "red";
                    this.drawPoint(
                        canvasContext,
                        necklaceKeypoint,
                        4
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
     * Sets whether the choker should be displayed.
     *
     * @param displayChoker Whether the choker should be displayed.
     */
    setDisplayChoker(displayChoker) {
        validateBoolean(displayChoker);
        this.displayChoker = displayChoker;
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