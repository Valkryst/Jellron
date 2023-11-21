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
                    this.drawPoint(canvasContext, chokerKeyPoint);
                }
            }

            if (this.displayNecklace) {
                const necklaceKeypoint = mesh.getNecklaceKeypoint();
                if (necklaceKeypoint != null) {
                    this.drawPoint(canvasContext, necklaceKeypoint);
                }
            }

            if (this.displayEarlobes) {
                for (const keypoint of mesh.getEarlobeKeypoints()) {
                    if (keypoint == null) {
                        continue;
                    }

                    this.drawPoint(canvasContext, keypoint);
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

        for (const keypoint of mesh.getBodyKeypoints()) {
            this.drawPoint(canvasContext, keypoint);
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

        for (const keypoint of mesh.getFaceKeypoints()) {
            this.drawPoint(canvasContext, keypoint);
        }
    }

    /**
     * Draws a Keypoint on a canvas.
     *
     * @param canvasContext Canvas context to draw on.
     * @param keypoint Keypoint to draw.
     */
    drawPoint(canvasContext, keypoint) {
        validateInstanceOf(canvasContext, CanvasRenderingContext2D);
        validateInstanceOf(keypoint, Keypoint);

        if (keypoint.getConfidence() < this.minimumConfidence) {
            return;
        }

        canvasContext.fillStyle = keypoint.getColour();

        const size = keypoint.getSize()
        const halfSize = size / 2;
        canvasContext.fillRect(keypoint.getX() - halfSize, keypoint.getY() - halfSize, size, size);
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
}