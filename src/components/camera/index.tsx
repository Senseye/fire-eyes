import React, { Component, RefObject } from 'react'
import * as posenet from '@tensorflow-models/posenet'

const EMOJI = '\u{1F525}'

class Camera extends Component {
    videoRef: RefObject<HTMLVideoElement> = React.createRef<HTMLVideoElement>()
    canvasRef: RefObject<HTMLCanvasElement> = React.createRef<HTMLCanvasElement>()

    componentDidMount() {
        this.setupCamera()
        this.decorateCameraVideo()
    }

    setupCamera() {
        const video = this.videoRef.current
        if (video && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({
                    audio: false,
                    video: { facingMode: { ideal: 'environment' } }, // prefer rear-facing camera
                })
                .then(stream => {
                    video.srcObject = stream
                }, console.error)
        }
    }

    async decorateCameraVideo() {
        const net = await posenet.load(0.5)
        const video = this.videoRef.current
        const canvas = this.canvasRef.current

        const renderFrame = () => {
            requestAnimationFrame(renderFrame)
            const context = canvas.getContext('2d')

            if (video && context && video.readyState === video.HAVE_ENOUGH_DATA) {
                net.estimateSinglePose(video).then(({ keypoints }) => {
                    const leftEye = keypoints.find(({ part }) => part === 'leftEye')
                    const rightEye = keypoints.find(({ part }) => part === 'rightEye')

                    if (context && leftEye && rightEye) {
                        context.drawImage(video, 0, 0)
                        this.drawEmojiOn(leftEye.position.x, leftEye.position.y)
                        this.drawEmojiOn(rightEye.position.x, rightEye.position.y)
                    }
                })
            }
        }
        renderFrame()
    }

    drawEmojiOn(x: number, y: number) {
        const canvas = this.canvasRef.current
        const context = canvas.getContext('2d')
        context.font = '32px serif'
        context.strokeText(EMOJI, x - 16, y + 16)
    }

    render() {
        return (
            <div>
                <canvas
                    ref={this.canvasRef}
                    id="canvas"
                    width={640}
                    height={480}
                    style={{
                        maxWidth: '100%',
                        width: '100%',
                        height: 'auto',
                    }}
                />
                <video
                    ref={this.videoRef}
                    id="video"
                    autoPlay
                    width={640}
                    height={480}
                    style={{ display: 'none' }}
                />
            </div>
        )
    }
}

export default Camera
