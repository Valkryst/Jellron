import {validateInstanceOf, validateNonEmptyString, validateString} from "./validation.js";

export class Camera {
    /**
     * Creates a new Camera object.
     *
     * @param {string} deviceId ID of the video input device to use.
     */
    constructor(deviceId) {
        this.deviceId = deviceId;

        this.videoElement = null;
    }

    /**
     * Creates or updates a select element, so that it lists available video input devices.
     *
     * The select element will be configured to automatically update as the set of available devices changes and when
     * the camera permissions are changed.
     *
     * @param {HTMLSelectElement|null} select The select element to populate. If unspecified, a new select element will be created.
     *
     * @returns {Promise<HTMLSelectElement>} A promise that resolves to a select element.
     */
    static async createOrUpdateSelectElement(select) {
        try {
            validateInstanceOf(select, HTMLSelectElement);
        } catch(e) {
            select = document.createElement("select");
        }

        select.innerHTML = "";
        select.appendChild(Camera.createOptionElement("Select a Device", ""));

        // Prompt the user for permission to use the webcam.
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Populate the select element with available video input devices.
        for (const device of (await Camera.getVideoInputDevices())) {
            if (device.label === "") {
                continue;
            }

            if (Array.from(select.options).some(option => option.value === device.deviceId)) {
                continue;
            }

            select.appendChild(Camera.createOptionElement(device.label, device.deviceId));
        }

        // Automatically update the select element when the camera permissions are changed.
        const cameraPermissionStatus = await navigator.permissions.query({ name: "camera" });
        cameraPermissionStatus.onchange = async () => await Camera.createOrUpdateSelectElement(select);

        // Automatically update the select element when the set of available devices changes.
        // todo Test this.
        navigator.mediaDevices.ondevicechange = async () => {
            const originalValue = select.value;
            const originalOnChange = select.onchange;

            select.onchange = null;
            await Camera.createOrUpdateSelectElement(select);

            if (Array.from(select.options).some(option => option.value === originalValue)) {
                select.value = originalValue;
            }

            select.onchange = originalOnChange;
        };

        return select;
    }

    /**
     * Creates an option element with the specified text and value.
     *
     * @param {string} text Text to display in the option element.
     * @param {string} value Value held by the option element.
     *
     * @returns {HTMLOptionElement} Created option element.
     */
    static createOptionElement(text, value) {
        validateNonEmptyString(text);
        validateString(value);

        const option = document.createElement("option");
        option.text = text;
        option.value = value;
        return option;
    }

    /**
     * Updates the `height`, `srcObject`, and `width` properties of the video element associated with this Camera.
     *
     * @returns {Promise<void>} A promise that resolves when the video element has been updated.
     */
    async updateVideoElement() {
        if (this.videoElement == null) {
            return;
        }

        this.videoElement.srcObject = await this.getVideoInputDevice();

        /*
         * Both FaceDetector and HandDetector use the video element's height and width properties to scale the input
         * MediaStream before processing it. This is why we need to set them.
         */
        this.videoElement.height = this.videoElement.clientWidth / (await this.getMediaStreamAspectRatio());
        this.videoElement.width = this.videoElement.clientWidth;
    }

    /**
     * Calculates the aspect ratio of the MediaStream associated with the video element of this Camera object.
     *
     * @returns {Promise<number>} A promise that resolves to the aspect ratio.
     */
    async getMediaStreamAspectRatio() {
        return (await this.getMediaStreamWidth()) / (await this.getMediaStreamHeight());
    }

    /**
     * Retrieves the height, in pixels, of the MediaStream stream associated with the video input device of this Camera
     * object.
     *
     * @returns {Promise<number>} A promise that resolves to the height.
     */
    async getMediaStreamHeight() {
        if (this.height == null) {
            const device = await this.getVideoInputDevice();
            const videoTracks = device.getVideoTracks();
            const capabilities = videoTracks[0].getCapabilities();
            this.height = capabilities.height.max;
        }

        return this.height;
    }

    /**
     * Retrieves the width, in pixels, of the MediaStream stream associated with the video input device of this Camera
     * object.
     *
     * @returns {Promise<number>} A promise that resolves to the width.
     */
    async getMediaStreamWidth() {
        if (this.width == null) {
            const device = await this.getVideoInputDevice();
            const videoTracks = device.getVideoTracks();
            const capabilities = videoTracks[0].getCapabilities();
            this.width = capabilities.width.max;
        }

        return this.width;
    }

    /**
     * Retrieves the video element associated with this Camera object, creating it if necessary.
     *
     * @throws {Error} If there is an issue retrieving the video input device.
     *
     * @returns {Promise<HTMLVideoElement>} A promise that resolves to a video element.
     */
    async getVideoElement() {
        if (this.videoElement != null) {
            await this.updateVideoElement();
            return this.videoElement;
        }

        const video = document.createElement("video");
        video.autoplay = true;
        video.muted = true;
        video.playsinline = true;
        this.videoElement = video;

        await this.updateVideoElement();
        return video;
    }

    /**
     * Attempts to retrieve the video input device associated with this Camera object.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia for a list of all exceptions.
     *
     * @throws {Error} If there is an issue retrieving the video input device.
     *
     * @returns {Promise<MediaStream>} A promise that resolves to the video input device with the specified ID.
     */
     async getVideoInputDevice() {
         if (this.device == null) {
             this.device = await navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: this.deviceId}}});
         }

         return this.device;
    }

    /**
     * Retrieves a list of available video input devices.
     *
     * @returns {Promise<MediaDeviceInfo[]>} A promise that resolves to a list of available video input devices.
     *
     * @throws {Error} If there is an issue retrieving the list of video input devices.
     */
    static async getVideoInputDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === "videoinput");
    }

    /**
     * Sets the video element associated with this Camera object.
     *
     * @param {HTMLVideoElement} videoElement The new video element to use.
     */
    async setVideoElement(videoElement) {
        validateInstanceOf(videoElement, HTMLVideoElement);
        this.videoElement = videoElement;
        await this.updateVideoElement();
    }
}