import {RunnableInterval} from "../runnable_interval.js";
import {OrthographicCamera, WebGLRenderer} from "three";
import {validateDefined, validateInstanceOf, validatePositiveNumber} from "../validation.js";

export class Renderer extends RunnableInterval {
    /**
     * Creates a new Renderer.
     *
     * @param {HTMLCanvasElement} canvas Canvas to use for rendering.
     */
    constructor(canvas) {
        super();
        this.setCanvas(canvas);
    }

    /**
     * Retrieves the camera to use for rendering.
     *
     * @returns {OrthographicCamera} Camera to use for rendering.
     */
    getCamera() {
        if (this.camera != null) {
            return this.camera;
        }

        const canvas = this.glContext.domElement;
        validateDefined(canvas);

        const halfCanvasWidth = canvas.width / 2;
        const halfCanvasHeight = canvas.height / 2;

        const camera = this.camera = new OrthographicCamera(
            -halfCanvasWidth,
            halfCanvasWidth,
            halfCanvasHeight,
            -halfCanvasHeight,
            1,
            1000
        );

        /*
         * As the camera's origin is in the bottom-right corner of the canvas, and all the Keypoints' origins are in
         * the top-left corner of the canvas, we need to offset the camera's position to render the Keypoints in the
         * correct location.
         */
        camera.position.x += halfCanvasWidth;
        camera.position.y -= halfCanvasHeight;

        // Move the camera backwards, so that all the Keypoints are visible.
        camera.position.z += 100;

        return camera;
    }

    /**
     * Sets the canvas to use for rendering.
     *
     * @param {HTMLCanvasElement} canvas Canvas to use for rendering.
     */
    setCanvas(canvas) {
        validateInstanceOf(canvas, HTMLCanvasElement);

        this.canvas = canvas;

        this.glContext = new WebGLRenderer({
            alpha: true,
            canvas: this.canvas
        });
        this.glContext.autoClear = true;
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