import {validateDefined, validateInstanceOf, validateNumber} from "./validation.js";

/*
 * See the following link for more information about the face landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md
 */
export class FaceDetector {
    static instance;

    /**
     * Creates a new FaceDetector object, or returns the existing one if it already exists.
     *
     * @returns {Promise<FaceDetector>} A promise that resolves with the FaceDetector object.
     */
    constructor() {
        if (FaceDetector.instance) {
            return FaceDetector.instance;
        }

        faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: "tfjs" }
        ).then(detector => this.detector = detector);

        this.intervalId = null;
        this.lastRuntime = 0;

        FaceDetector.instance = this;
    }

    /**
     * Starts the detector.
     *
     * @param updatesPerSecond Desired number of updates per second.
     * @param videoElement Video element to use for detection.
     * @param mesh Mesh to update with the detected face.
     */
    async start(updatesPerSecond, videoElement, mesh) {
        validateNumber(updatesPerSecond);
        validateInstanceOf(videoElement, HTMLVideoElement)

        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            this.stop();
        }

        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            const rawFaces = await this.detector.estimateFaces(videoElement);
            if (rawFaces.length === 0) {
                return;
            }

            const rawFace = rawFaces[0];
            for (let i = 0 ; i < rawFace.keypoints.length ; i++) {
                this.relabelKeypoint(i, rawFace.keypoints[i]);
            }

            mesh.updateFaceKeypoints(rawFace);

            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / updatesPerSecond);
    }

    /** Stops the detector. */
    stop() {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Relabels a raw Keypoint object, if necessary.
     *
     * Some calculations require specific points which have generic names. To get around this, we rename
     * these points to something more specific.
     *
     * The array of points is, as far as I can tell, always in the same order. This means that we can
     * reference the following mesh diagram to find specific points and rename them.
     *
     * https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/mesh_map.jpg
     *
     * @param {number} index Index of the Keypoint in the array of Keypoints.
     * @param {object} rawKeypoint Raw Keypoint object to relabel.
     */
    relabelKeypoint(index, rawKeypoint) {
        validateDefined(rawKeypoint);

        let name = rawKeypoint.name;

        switch (index) {
            case 10: {
                name = "top_edge_face";
                break;
            }
            case 152: {
                name = "bottom_edge_face";
                break;
            }
            case 164: {
                name = "midpoint_between_nose_and_mouth";
                break;
            }
            case 234: {
                name = "right_edge_face";
                break;
            }
            case 454: {
                name = "left_edge_face";
                break;
            }
        }

        rawKeypoint.name = name;
    }

    /**
     * Determines whether the detector is ready to be used.
     *
     * @returns {boolean} Whether the detector is ready to be used.
     */
    isReady() {
        return this.detector != null;
    }

    /**
     * Determines whether the detector is currently running.
     *
     * @returns {boolean} Whether the detector is currently running.
     */
    isRunning() {
        return this.intervalId != null;
    }

    /**
     * Retrieves the most recent runtime of the detector, in milliseconds.
     *
     * @returns {number} Most recent runtime of the detector, in milliseconds.
     */
    getLastRuntime() {
        return this.lastRuntime;
    }
}