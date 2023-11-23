Jellron (Jel-lr-on) is a personal experimental playground designed to explore and practice augmented reality in the browser.

[View the live demo](http://valkryst.github.io/Jellron/).

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
- `createOrUpdateVideoElement(HTMLVideoElement)` - Creates or updates a video element with the selected video input device.