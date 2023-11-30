import {Detector} from "./detector.js";
import {validateDefined, validateInstanceOf, validateNumber} from "../validation.js";

/**
 * See the following link for more information about the hand detection model:
 * https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection/src/tfjs
 */
export class HandDetector extends Detector {
    static instance;

    /** Creates a new HandDetector object, or returns the existing one if it already exists. */
    constructor() {
        if (HandDetector.instance) {
            return HandDetector.instance;
        }
        super();
        HandDetector.instance = this;

        handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            {runtime: "tfjs"}
        ).then(detector => this.detector = detector);
    }

    /**
     * Starts the detector.
     *
     * @param updatesPerSecond Desired number of updates per second.
     * @param videoElement Video element to use for detection.
     * @param mesh Mesh to update with the detected body.
     */
    async start(updatesPerSecond, videoElement, mesh) {
        validateNumber(updatesPerSecond);
        validateInstanceOf(videoElement, HTMLVideoElement);

        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            this.stop();
        }

        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            let rawHands = [];
            try {
                rawHands = await this.detector.estimateHands(videoElement);
            } catch (e) {
                /*
                 * Depending on the state of the video element, this can throw a "Requested texture size [0x0] is
                 * invalid." error. It doesn't seem to cause any issues, so we ignore it.
                 */
            }

            if (rawHands.length === 0) {
                this.lastRuntime = performance.now() - currentTime;
                return;
            }

            for (const rawHand of rawHands) {
                for (const rawKeypoint of rawHand.keypoints) {
                    this.relabelKeypoint(rawHand, rawKeypoint);
                }
            }

            mesh.updateHandKeypoints(rawHands);
            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / updatesPerSecond);
    }

    /**
     * Relabels a raw Keypoint object.
     *
     * Some calculations require specific points which have generic names. To get around this, we rename
     * these points to something more specific.
     *
     * The array of points is, as far as I can tell, always in the same order. This means that we can
     * reference the following mesh diagram to find specific points and rename them.
     *
     * https://camo.githubusercontent.com/b0f077393b25552492ef5dd7cd9fd13f386e8bb480fa4ed94ce42ede812066a1/68747470733a2f2f6d65646961706970652e6465762f696d616765732f6d6f62696c652f68616e645f6c616e646d61726b732e706e67
     *
     * @param {object} rawHand Raw Hand object of the Keypoint to relabel.
     * @param {object} rawKeypoint Raw Keypoint object to relabel.
     */
    relabelKeypoint(rawHand, rawKeypoint) {
        validateDefined(rawHand);
        validateDefined(rawKeypoint);

        rawKeypoint.name = `${rawHand.handedness.toLowerCase()}_${rawKeypoint.name}`;
    }
}