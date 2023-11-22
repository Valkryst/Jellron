import { validateInstanceOf, validateNonEmptyString} from "./validation.js";

export class Camera {
    /**
     * Attempts to display the video input feed from the specified video input device in the specified video element.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia for a list of all exceptions.
     *
     * @param video The video element to display the video input feed.
     * @param deviceId ID of the video input device to use.
     * @returns {Promise<void>}
     */
    static async displayVideoInput(video, deviceId) {
        validateInstanceOf(video, HTMLVideoElement);
        video.srcObject = await Camera.getVideoInputDevice(deviceId);
    }

    /**
     * Populates a select element with available video input devices.
     *
     * @param videoSelect The select element to populate.
     *
     * @returns {Promise<void>} A promise that resolves when the select element has been populated.
     */
    static async populateVideoInputSelect(videoSelect) {
        videoSelect.innerHTML = "";

        const option = document.createElement("option");
        option.value = "";
        option.text = "Select a Device";
        videoSelect.appendChild(option);

        validateInstanceOf(videoSelect, HTMLSelectElement);

        for (const device of (await Camera.getVideoInputDevices())) {
            if (device.label === "") {
                continue;
            }

            const option = document.createElement("option");
            option.text = device.label;
            option.value = device.deviceId;
            videoSelect.appendChild(option);
        }
    }

    /**
     * Prompts the user for permission to use the webcam.
     *
     * @returns {Promise<void>} A promise that resolves when the user grants permission to use the webcam.
     */
    static async promptForPermissions() {
        await navigator.mediaDevices.getUserMedia({ video: true });
    }

    /**
     * Attempts to retrieve the video input device with the specified ID.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia for a list of all exceptions.
     *
     * @param deviceId ID of the video input device to use.
     * @returns {Promise<MediaStream>} A promise that resolves to the video input device with the specified ID.
     */
    static async getVideoInputDevice(deviceId) {
        validateNonEmptyString(deviceId);
        return await navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: deviceId}}});
    }

    /**
     * Retrieves a list of available video input devices.
     *
     * @returns {Promise<MediaDeviceInfo[]>} A promise that resolves to a list of available video input devices.
     *
     * @throws {DOMException} If the user denies permission to use the webcam.
     */
    static async getVideoInputDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === "videoinput");
    }
}