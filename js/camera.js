import {validateNonEmptyString, validateString} from "./utility/validation.js";

export class Camera {
    static selectElement = null;

    /**
     * Creates a new Camera object.
     *
     * @param {string} deviceId ID of the video input device to use.
     */
    constructor(deviceId) {
        this.deviceId = deviceId;

        this.jellronDisplay = document.getElementById("jellron-display");
        this.videoElement = null;
    }

    /**
     * Retrieves the select element associated with this Camera object, creating it if necessary.
     *
     * The select element is configured to automatically update as the set of available devices changes, and when the
     * camera permissions are changed.
     *
     * @returns {Promise<HTMLSelectElement>} A promise that resolves to a select element.
     */
    static async getSelectElement() {
        if (Camera.selectElement) {
            await Camera.updateSelectElement();
            return Camera.selectElement;
        }

        const select = document.createElement("select");
        select.disabled = true;
        select.id = "video-input-device-select";
        Camera.selectElement = select;

        await Camera.updateSelectElement();
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
     * Updates the select element.
     *
     * @returns {Promise<void>} A promise that resolves when the select element has been updated.
     */
    static async updateSelectElement() {
        if (Camera.selectElement == null) {
            return;
        }

        Camera.selectElement.innerHTML = "";
        Camera.selectElement.appendChild(Camera.createOptionElement("Select a Device", ""));

        // Prompt the user for permission to use the webcam.
        try {
            await navigator.mediaDevices.getUserMedia({video: true});
        } catch (error) {
            if (error.name === "NotReadableError") {
                /*
                 * This occurs when the camera is already in-use by another application. For example, if OBS is open
                 * and using it before the browser page is opened. After some testing, it appears as though we can
                 * swallow this error and the dropdown will still be populated with the available devices and they
                 * can be selected and used.
                 */
            }
        }

        // Populate the select element with available video input devices.
        for (const device of (await Camera.getVideoInputDevices())) {
            if (device.label === "") {
                continue;
            }

            if (Array.from(Camera.selectElement.options).some(option => option.value === device.deviceId)) {
                continue;
            }

            Camera.selectElement.appendChild(Camera.createOptionElement(device.label, device.deviceId));
        }

        document.getElementById("warning").hidden = Camera.selectElement.options.length !== 1;

        // Automatically update the select element when the camera permissions are changed.
        try {
            const cameraPermissionStatus = await navigator.permissions.query({name: "camera"});
            cameraPermissionStatus.onchange = async () => await Camera.updateSelectElement();
        } catch (e) {
            // The browser does not support the Permissions API.
        }

        // Automatically update the select element when the set of available devices changes.
        // todo Test this.
        navigator.mediaDevices.ondevicechange = async () => {
            const originalValue = Camera.selectElement.value;
            const originalOnChange = Camera.selectElement.onchange;

            Camera.selectElement.onchange = null;
            await Camera.updateSelectElement();

            if (Array.from(Camera.selectElement.options).some(option => option.value === originalValue)) {
                Camera.selectElement.value = originalValue;
            }

            Camera.selectElement.onchange = originalOnChange?.();
        };
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

        const aspectRatio = await this.getMediaStreamWidth() / await this.getMediaStreamHeight();
        this.videoElement.parentElement.style.aspectRatio = aspectRatio;
        this.videoElement.style.aspectRatio = aspectRatio;

        this.videoElement.width = this.jellronDisplay.scrollWidth;
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
        if (this.videoElement) {
            await this.updateVideoElement();
            return this.videoElement;
        }

        const video = document.getElementById("jellron-video");
        video.setAttribute("autoplay", "")
        video.setAttribute("muted", "")
        video.setAttribute("playsinline", "");
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
             this.device = await navigator.mediaDevices.getUserMedia({
                 video: {
                     aspectRatio: 4 / 3,
                     deviceId: {exact: this.deviceId}
                 }
             });
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
}