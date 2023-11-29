Jellron (Jel-lr-on) is a personal experimental playground designed to explore and practice augmented reality in the browser.

[View the live demo](http://valkryst.github.io/Jellron/).

## Table of Contents

* [Features](https://github.com/Valkryst/Jellron#features)
  * [Keypoint Tracking](https://github.com/Valkryst/Jellron#keypoint-tracking)
  * [Keypoint Rendering](https://github.com/Valkryst/Jellron#keypoint-rendering)
  * [Device Management](https://github.com/Valkryst/Jellron#device-management)
* [Browser Support](https://github.com/Valkryst/Jellron#browser-support)
* [Device Performance](https://github.com/Valkryst/Jellron#device-performance)

## Features

### Keypoint Tracking

A number of _Detector_ classes are available to track keypoints for different body parts:

- [BodyDetector](https://github.com/Valkryst/Jellron/blob/master/js/body_detector.js) - Detects a single body and tracks keypoints using the [pose-detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/blazepose_tfjs) TensorFlow model.
- [FaceDetector](https://github.com/Valkryst/Jellron/blob/master/js/face_detector.js) - Detects a single face and tracks keypoints using the [face-landmarks-detection](https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection/src/tfjs) TensorFlow model.
- [HandDetector](https://github.com/Valkryst/Jellron/blob/master/js/hand_detector.js) - Detects a single set of hands and tracks their keypoints using the [hand-pose-detection](https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection/src/tfjs) TensorFlow model.

Additionally, the [Mesh](https://github.com/Valkryst/Jellron/blob/master/js/mesh.js) class offers the following functions to guesstimate positions for a number of other keypoints:

- `getChokerPosition()` - Returns the position of the choker.
- `getEarlobePosition()` - Returns the position of the earlobes.
- `getNecklacePosition()` - Returns the position of the necklace.

### Keypoint Rendering

[Keypoints](https://github.com/Valkryst/Jellron/blob/master/js/keypoint.js) are rendered using the
[Three.js](https://threejs.org/) library VIA the [MeshRenderer](https://github.com/Valkryst/Jellron/blob/master/js/mesh_renderer.js)
class. Each keypoint represents a point in 3D space and is rendered as a 2D rectangle by default.

### Device Management

As all the _Detector_ classes require a video input device, this library provides the [Camera](https://github.com/Valkryst/Jellron/blob/master/js/camera.js)
class provides the following functions to help the user select a device to use and to display its MediaStream in a 
`<video>` element:

- `createOrUpdateSelectElement(HTMLSelectElement)` - Creates or updates a select element with the available video input devices.
- `getVideoElement()` - Returns the Camera's video element.
- `setVideoElement(HTMLVideoElement)` - Sets the Camera's video element.
- `updateVideoElement(HTMLVideoElement)` - Updates the Camera's video element to reflect changes to the MediaStream.

## Browser Support

This library has been tested on the following browsers/devices:

| Device                  | OS           | Browser | Version | Status | Notes                                                                                                 |
|:------------------------|:-------------|:--------|:--------|:-------|:------------------------------------------------------------------------------------------------------|
| Personal Computer       | Windows 11   | Chrome  | 119.0   | ✅      | It takes ~10 seconds to start running smoothly.                                                       |
| Personal Computer       | Windows 11   | Edge    | 119.0   | ✅      |                                                                                                       |
| Personal Computer       | Windows 11   | FireFox | 120.0   | ❌      | See issue #14.                                                                                        |
| iPad Air                | iOS 12.5.7   | Safari  | 12.1    | ❌      | Potential import issue as JS console outputs an error accessing the `Camera` class.                   |
| iPhone 12 Pro           | iOS 17.1.1   | Safari  | 17.1    | ✅      | See issue #15.                                                                                        |
| Macbook Pro (15", 2019) | macOS 13.5.1 | Safari  | 16.6    | ✅      | See issue #15.                                                                                        |
| Macbook Pro (15", 2019) | macOS 14.1.1 | Safari  | 17.1    | ✅      | See issue #15.                                                                                        |                                                      

## Device Performance

Only standardized devices are listed in the table below, as their performance is more likely to be consistent across
devices.

The values listed in the table represent the number of milliseconds taken for one frame to be processed by a _Detector_
class.

* For values < 100ms, I rounded up to the nearest 5ms.
* For values between 100ms to 1000ms, I rounded up to the nearest 10ms.
* For values > 1000ms, I rounded up to the nearest 100ms.

| Device                        | OS           | Browser | Version | Power Supply | Class        | Avg.       |
|:------------------------------|:-------------|:--------|:--------|:-------------|:-------------|:-----------|
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Battery      | BodyDetector | 35         |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Battery      | FaceDetector | 130        |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Battery      | HandDetector | 120        |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Charger      | BodyDetector | 35         |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Charger      | FaceDetector | No change. |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Charger      | HandDetector | No change. |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Battery      | BodyDetector | 50         |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Battery      | FaceDetector | 390        |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Battery      | HandDetector | 1100       |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Charger      | BodyDetector | 45         |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Charger      | FaceDetector | 220        |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Charger      | HandDetector | 620        |