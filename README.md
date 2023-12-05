Jellron (Jel-lr-on) is a personal experimental playground designed to explore and practice augmented reality in the browser.

[View the live demo](http://valkryst.github.io/Jellron/).

## Table of Contents

* [Features](https://github.com/Valkryst/Jellron#features)
  * [Keypoint Tracking](https://github.com/Valkryst/Jellron#keypoint-tracking)
  * [Keypoint Rendering](https://github.com/Valkryst/Jellron#keypoint-rendering)
  * [Device Management](https://github.com/Valkryst/Jellron#device-management)
* [Usage](https://github.com/Valkryst/Jellron#usage)
  * [Styling](https://github.com/Valkryst/Jellron#styling) 
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

## Usage

### Events

#### Detector Events

The _Detector_ classes emit the following events:

* `ready` - Emitted when the detector's TFJS model has finished loading.
* `started` - Emitted when the detector starts running.
* `stopped` - Emitted when the detector stops running.
* `updated` - Emitted when the detector has _detected and updated_ the position of its keypoints.
  * The event's `runtime` property contains the number of milliseconds taken to detect and update the keypoints.

#### Renderer Events

The _Renderer_ classes emit the following events:

* `rendered` - Emitted when the renderer has finished rendering a frame.
  * The event's `runtime` property contains the number of milliseconds taken to render the frame. 
* `resized` - Emitted when the renderer's `setSize` function updates the size of its canvas.
  * The event's `width` and `height` properties contain the new size of the canvas. 
* `started` - Emitted when the renderer starts running.
* `stopped` - Emitted when the renderer stops running.

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
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Charger      | BodyDetector | No change. |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Charger      | FaceDetector | No change. |
| iPhone 12 Pro                 | iOS 17.1.1   | Safari  | 17.1    | Charger      | HandDetector | No change. |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Battery      | BodyDetector | 50         |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Battery      | FaceDetector | 390        |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Battery      | HandDetector | 1100       |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Charger      | BodyDetector | 45         |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Charger      | FaceDetector | 220        |
| Macbook Pro (15", 2019)       | macOS 14.1.1 | Safari  | 17.1    | Charger      | HandDetector | 620        |
