import {Detector} from "./detector.js";
import {Mesh} from "../mesh.js";
import {validateDefined, validateInstanceOf} from "../validation.js";

/*
 * See the following link for more information about the face landmarks detection model:
 * https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md
 */
export class FaceDetector extends Detector {
    static instance;

    /** Creates a new FaceDetector object, or returns the existing one if it already exists. */
    constructor() {
        if (FaceDetector.instance) {
            return FaceDetector.instance;
        }

        super();
        FaceDetector.instance = this;

        faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: "tfjs" }
        ).then(detector => this.detector = detector);
    }

    /** @type Detector['detectAndUpdate'] */
    async detectAndUpdate(frame, mesh) {
        validateInstanceOf(frame, tf.Tensor);
        validateInstanceOf(mesh, Mesh);

        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        const currentTime = performance.now();

        let rawFaces = [];
        try {
            rawFaces = await this.detector.estimateFaces(frame);
        } catch (e) {
            /*
             * Depending on the state of the video element, this can throw a "Requested texture size [0x0] is
             * invalid." error. It doesn't seem to cause any issues, so we ignore it.
             */
        }

        if (rawFaces.length > 0) {
            const rawFace = rawFaces[0];
            for (let i = 0 ; i < rawFace.keypoints.length ; i++) {
                this.relabelKeypoint(i, rawFace.keypoints[i]);
            }

            mesh.updateFaceKeypoints(rawFace);
        }

        this.lastRuntime = performance.now() - currentTime;
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