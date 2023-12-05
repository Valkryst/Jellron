import {Detector} from "./detector.js";
import {Mesh} from "../mesh.js";
import {validateDefined, validateInstanceOf} from "../utility/validation.js";

/*
 * See the following link for more information about the face landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md
 */
export class FaceDetector extends Detector {
    /** Desired number of frames per second. */
    static fps = 30;

    /** Singleton instance of the HandDetector. */
    static instance;

    /**
     * Creates a new FaceDetector, or returns the existing one if it already exists.
     *
     * @param {Mesh} mesh Mesh to update with the detected face keypoints.
     */
    constructor(mesh) {
        if (FaceDetector.instance) {
            return FaceDetector.instance;
        }

        validateInstanceOf(mesh, Mesh);

        super();
        FaceDetector.instance = this;

        this.mesh = mesh;
        this.inputElement = document.getElementById("jellron-video-canvas");

        faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: "tfjs" }
        ).then(detector => {
            this.detector = detector;
            this.dispatchEvent(new CustomEvent("ready"));
        });
    }

    /** @type RunnableInterval["start"] */
    start() {
        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            throw new Error("Already running.");
        }

        this.dispatchEvent(new CustomEvent("started"));
        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            let rawFaces = [];
            try {
                rawFaces = await this.detector.estimateFaces(this.inputElement);
            } catch (e) {
                /*
                 * Depending on the state of the video element, this can throw a "Requested texture size [0x0] is
                 * invalid." error. It doesn't seem to cause any issues, so we ignore it.
                 */
            }

            let rawFace = null;
            if (rawFaces.length > 0) {
                rawFace = rawFaces[0];
                for (let i = 0 ; i < rawFace.keypoints.length ; i++) {
                    this.relabelKeypoint(i, rawFace.keypoints[i]);
                }
            }

            this.mesh.updateFaceKeypoints(rawFace);

            this.lastRuntime = performance.now() - currentTime;
            this.dispatchEvent(new CustomEvent("updated", {detail: {runtime: this.lastRuntime}}));
        }, 1000 / FaceDetector.fps);
    }

    /**
     * @type Detector['relabelKeypoint']
     *
     * See the following link for a diagram of the face keypoints: https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/mesh_map.jpg
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
}