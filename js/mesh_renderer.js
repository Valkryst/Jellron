import {Mesh} from "./mesh.js";
import {validateInstanceOf, validateNumber} from "./validation.js";

export class MeshRenderer {
    constructor() {
        this.intervalId = null;
        this.lastRuntime = 0;
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
            this.stop;
        }

        this.intervalId = setInterval(() => {
            const currentTime = performance.now();

            canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);

            mesh.drawFaceKeypoints(canvasContext);
            mesh.drawBodyKeypoints(canvasContext);

            const chokerKeyPoint = mesh.getChokerKeypoint();
            if (chokerKeyPoint != null) {
                mesh.drawKeypoint(
                    canvasContext,
                    chokerKeyPoint,
                    "blue",
                    4
                );
            }

            const necklaceKeypoint = mesh.getNecklaceKeypoint();
            if (necklaceKeypoint != null) {
                mesh.drawKeypoint(
                    canvasContext,
                    necklaceKeypoint,
                    "red",
                    4
                );
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
     * Retrieves the most recent runtime of the renderer, in milliseconds.
     *
     * @returns {number} Most recent runtime of the renderer, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}