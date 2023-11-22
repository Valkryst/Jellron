import {Keypoint} from "./keypoint.js";
import {Mesh} from "./mesh.js";
import {OrthographicCamera, Scene, WebGLRenderer} from "three";
import {
    validateBoolean,
    validateInstanceOf,
    validateNumber,
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
     * @param {number} drawsPerSecond Desired number of draws per second.
     * @param {WebGLRenderer} glContext Canvas context to draw on.
     * @param {Mesh} mesh Mesh to draw.
     */
    start(drawsPerSecond, glContext, mesh) {
        validateNumber(drawsPerSecond);
        validateInstanceOf(glContext, WebGLRenderer);
        validateInstanceOf(mesh, Mesh);

        if (this.intervalId != null) {
            this.stop();
        }

        const camera = this.createCamera(glContext);
        const scene = new Scene();

        this.intervalId = setInterval(() => {
            const currentTime = performance.now();

            for (const keypoint of mesh.getFaceKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayFace) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            for (const keypoint of mesh.getBodyKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayBody) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            const chokerKeyPoint = mesh.getChokerKeypoint();
            if (chokerKeyPoint != null) {
                if (this.displayChoker) {
                    this.placePoint(scene, chokerKeyPoint);
                } else {
                    scene.remove(chokerKeyPoint.getMesh());
                }
            }

            const necklaceKeypoint = mesh.getNecklaceKeypoint();
            if (necklaceKeypoint != null) {
                if (this.displayNecklace) {
                    this.placePoint(scene, necklaceKeypoint);
                } else {
                    scene.remove(necklaceKeypoint.getMesh());
                }
            }

            for (const keypoint of mesh.getEarlobeKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayEarlobes) {
                    this.placePoint(scene, keypoint);
                } else {
                    scene.remove(keypoint.getMesh());
                }
            }

            glContext.render(scene, camera);

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
     * Constructs a camera to use when rendering a Scene.
     *
     * @param {WebGLRenderer} glContext Context to draw on.
     *
     * @returns {OrthographicCamera} The constructed camera.
     */
    createCamera(glContext) {
        const canvas = glContext.domElement;

        const halfCanvasWidth = canvas.width / 2;
        const halfCanvasHeight = canvas.height / 2;

        const camera = new OrthographicCamera(
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
     * Draws the body of a Mesh on a canvas.
     *
     * @param {Scene} scene Scene to place the keypoint in.
     * @param mesh Mesh whose body to draw.
     */
    drawBody(scene, mesh) {
        validateInstanceOf(scene, Scene);
        validateInstanceOf(mesh, Mesh);

        for (const keypoint of mesh.getBodyKeypoints()) {
            this.placePoint(scene, keypoint);
        }
    }

    /**
     * Draws the face of a Mesh on a canvas.
     *
     * @param {Scene} scene Scene to place the keypoint in.
     * @param mesh Mesh whose face to draw.
     */
    drawFace(scene, mesh) {
        validateInstanceOf(scene, Scene);
        validateInstanceOf(mesh, Mesh);

        for (const keypoint of mesh.getFaceKeypoints()) {
            this.placePoint(scene, keypoint);
        }
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