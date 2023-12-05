import {Detector} from "./detector.js";
import {Mesh} from "../mesh.js";
import {validateDefined, validateInstanceOf, validateNumber} from "../validation.js";

/**
 * See the following link for more information about the hand detection model:
 * https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection/src/tfjs
 */
export class HandDetector extends Detector {
    /** Desired number of frames per second. */
    static fps = 10;

    /** Singleton instance of the HandDetector. */
    static instance;

    /**
     * Creates a new HandDetector, or returns the existing one if it already exists.
     *
     * @param {Mesh} mesh Mesh to update with the detected hand keypoints.
     */
    constructor(mesh) {
        if (HandDetector.instance) {
            return HandDetector.instance;
        }

        validateInstanceOf(mesh, Mesh);

        super();
        HandDetector.instance = this;

        this.mesh = mesh;
        this.videoElement = document.getElementById("jellron-video");

        handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            {runtime: "tfjs"}
        ).then(detector => this.detector = detector);
    }

    /** @type RunnableInterval["start"] */
    start() {
        if (this.detector == null) {
            throw new Error("Detector not initialized.");
        }

        if (this.intervalId != null) {
            throw new Error("Already running.");
        }

        this.intervalId = setInterval(async () => {
            const currentTime = performance.now();

            let rawHands = [];
            try {
                rawHands = await this.detector.estimateHands(this.videoElement);
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

            this.mesh.updateHandKeypoints(rawHands);
            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / HandDetector.fps);
    }

    /**
     * @type Detector['relabelKeypoint']
     *
     * See the following link for a diagram of the hand keypoints: https://camo.githubusercontent.com/b0f077393b25552492ef5dd7cd9fd13f386e8bb480fa4ed94ce42ede812066a1/68747470733a2f2f6d65646961706970652e6465762f696d616765732f6d6f62696c652f68616e645f6c616e646d61726b732e706e67
     */
    relabelKeypoint(rawHand, rawKeypoint) {
        validateDefined(rawHand);
        validateDefined(rawKeypoint);

        rawKeypoint.name = `${rawHand.handedness.toLowerCase()}_${rawKeypoint.name}`;
    }
}