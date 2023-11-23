import {Keypoint} from "./keypoint.js";
import {Mesh} from "./mesh.js";
import {OrthographicCamera, Scene, WebGLRenderer} from "three";
import {
    validateBoolean,
    validateInstanceOf, validateNonEmptyString,
    validateNumber
} from "./validation.js";

export class MeshRenderer {
    constructor() {
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

            for (const keypoint of mesh.getHandKeypoints()) {
                if (keypoint == null) {
                    continue;
                }

                if (this.displayHands) {
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
     * Displays a 2D necklace on the necklace Keypoint.
     *
     * @param {Mesh} mesh Mesh to display the necklace on.
     * @param {string} url URL of the necklace to display.
     */
    display2DNecklace(mesh, url) {
        validateInstanceOf(mesh, Mesh);
        validateNonEmptyString(url);

        const necklaceKeypoint = mesh.getNecklaceKeypoint();
        necklaceKeypoint.display2DAsset(url, () => {
            // todo Ensure this cannot continue running forever. It should stop and print an error if it runs for too long.
            const interval = setInterval(() => {
                const shoulderLeftKeypoint = mesh.getKeypointByLabel('left_shoulder');
                if (shoulderLeftKeypoint == null) {
                    return;
                }

                const shoulderRightKeypoint = mesh.getKeypointByLabel('right_shoulder');
                if (shoulderRightKeypoint == null) {
                    return;
                }

                const distance = this.distanceBetweenKeypoints(shoulderLeftKeypoint, shoulderRightKeypoint);
                const aspectRatio = necklaceKeypoint.getWidth() / necklaceKeypoint.getHeight();

                const scale = 0.5;
                necklaceKeypoint.setHeight(distance * scale);
                necklaceKeypoint.setWidth(distance * aspectRatio * scale);

                clearInterval(interval);
            }, 100);
        });
    }

    /**
     * Calculates the distance between two Keypoints.
     *
     * @param {Keypoint} keypoint1 First Keypoint.
     * @param {Keypoint} keypoint2 Second Keypoint.
     *
     * @returns {number} Distance between the Keypoints.
     */
    distanceBetweenKeypoints(keypoint1, keypoint2) {
        validateInstanceOf(keypoint1, Keypoint);
        validateInstanceOf(keypoint2, Keypoint);

        return Math.sqrt(
            Math.pow(keypoint1.getX() - keypoint2.getX(), 2) +
            Math.pow(keypoint1.getY() - keypoint2.getY(), 2)
        );
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
}