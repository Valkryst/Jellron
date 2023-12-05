import {Renderer} from "./renderer.js";
import {FrontSide, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, SRGBColorSpace, VideoTexture} from "three";

export class VideoRenderer extends Renderer {
    /** Desired number of frames per second. */
    static fps = 60;

    /** Singleton instance of the VideoRenderer. */
    static instance = null;

    /**
     * Constructs a new VideoRenderer, or returns the existing singleton instance if it already exists.
     *
     * @returns {VideoRenderer} VideoRenderer instance.
     */
    constructor() {
        if (VideoRenderer.instance) {
            return VideoRenderer.instance;
        }

        super(document.getElementById("jellron-video-canvas"));
        this.video = document.getElementById("jellron-video");
    }

    /** @type RunnableInterval["start"] */
    start() {
        if (this.intervalId != null) {
            throw new Error("Already running.");
        }

        const scene = new Scene();
        scene.add(this.getMesh());

        this.intervalId = setInterval(() => {
            const currentTime = performance.now();

            this.glContext.render(scene, this.getCamera());

            this.lastRuntime = performance.now() - currentTime;
        }, 1000 / VideoRenderer.fps);
    }

    /**
     * Retrieves the mesh to be rendered.
     *
     * @returns {Mesh} Mesh to be rendered.
     */
    getMesh() {
        if (this.mesh != null) {
            return this.mesh;
        }

        const texture = new VideoTexture(this.video);
        texture.colorSpace = SRGBColorSpace;

        const material = new MeshBasicMaterial({
            map: texture,
            side: FrontSide,
            transparent: true
        });

        const mesh = this.mesh = new Mesh(
            new PlaneGeometry(this.canvas.scrollWidth, this.canvas.scrollHeight),
            material
        );

        // todo Determine why we need to apply an offset.
        mesh.position.x += this.video.scrollWidth / 2;
        mesh.position.y -= this.video.scrollHeight / 2;

        return mesh;
    }
}