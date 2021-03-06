<template>
  <div class="sceneContainer">
    <div class="scene" ref="sceneRef"></div>
    <button v-show="controlsToggle" class="btn close" @click="closeVis">X</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import LiveAudio from '../../services/liveAudio-utils'
import * as THREE from 'three'
import SimplexNoise from 'simplex-noise'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'

@Component
export default class VisualizerCanvas extends Vue {
  @Prop({ required: true })
  controlsToggle!: boolean

  static liveAudio: LiveAudio;
  static noise: SimplexNoise;
  static scene: THREE.Scene;
  static camera: THREE.PerspectiveCamera;
  static renderer: THREE.WebGLRenderer;
  static composer: EffectComposer
  static shapeArr: THREE.Mesh[];
  static shapeCloudArr: THREE.Points[];
  static circleSprite: THREE.Texture;
  static shapeMax: number;
  static layerMarker: number[];
  static shapeColour: string;
  static freqKey: number;
  static spinConstants: number[];
  private changingMode!: boolean;
  private animationID!: number;
  private rotateShapeToggle: boolean;

  constructor () {
    super()
    VisualizerCanvas.liveAudio = new LiveAudio()
    VisualizerCanvas.noise = new SimplexNoise()
    VisualizerCanvas.camera = new THREE.PerspectiveCamera()
    VisualizerCanvas.renderer = new THREE.WebGLRenderer({ antialias: true })
    VisualizerCanvas.scene = new THREE.Scene()
    VisualizerCanvas.shapeArr = []
    VisualizerCanvas.shapeCloudArr = []
    VisualizerCanvas.circleSprite = new THREE.TextureLoader().load('/textures/spark1.png')
    VisualizerCanvas.shapeMax = 529
    VisualizerCanvas.layerMarker = []
    VisualizerCanvas.shapeColour = '#FFF'
    VisualizerCanvas.freqKey = 4
    VisualizerCanvas.spinConstants = [0.03, 0.015, 0.075, 0.0025, 0.001]
    this.rotateShapeToggle = false
  }

  get CameraZoomToggle () {
    return this.$store.state.cameraZoomToggle
  }

  get CameraRotateToggle () {
    return this.$store.state.cameraRotateToggle
  }

  get RandomMode () {
    return this.$store.state.randomMode
  }

  get RandomColour () {
    return this.$store.state.randomColour
  }

  get ModeKey () {
    return this.$store.state.modeKey
  }

  get ColourKey () {
    return this.$store.state.colourKey
  }

  get SpotifyAnalysisUtils () {
    return this.$store.state.spotifyAnalysisUtils
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  get PlayerInfo () {
    return this.$store.state.playerInfo
  }

  get TrackTime () {
    return this.$store.state.trackPosition
  }

  closeVis () {
    this.$store.commit('mutateOpenVisualizer', false)
  }

  mounted () {
    if (VisualizerCanvas.shapeArr.length === 0) {
      console.log('Empty visualizer')
      this.setupVisualizer()
    }
    this.$store.commit('mutateModeKey', 1)
    this.$store.commit('mutateColourKey', 1)
    this.$gtag.pageview({
      page_title: 'Visualizer',
      page_path: '/visualizer',
      page_location: '/visualizer'
    })
    // stats
    // this.stats = new (Stats as any)()
    // document.body.appendChild(this.stats.dom)
  }

  beforeDestroy () {
    VisualizerCanvas.removeShape()
    cancelAnimationFrame(this.animationID)
  }

  private setupVisualizer () {
    this.changingMode = true
    const el = this.$refs.sceneRef as Element
    this.$nextTick(() => {
      VisualizerCanvas.camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)
      VisualizerCanvas.renderer.setSize(window.innerWidth, window.innerHeight)
      VisualizerCanvas.renderer.setPixelRatio(window.devicePixelRatio)
      VisualizerCanvas.camera.aspect = window.innerWidth / window.innerHeight
      el.appendChild(VisualizerCanvas.renderer.domElement)
      this.canvasResizeListener(el)

      VisualizerCanvas.addLighting()
      VisualizerCanvas.addOcean()
      VisualizerCanvas.camera.position.set(0, -window.innerHeight / 8, 0)
      VisualizerCanvas.camera.rotation.set(0, Math.PI / 4, 0)
      // postprocessing
      VisualizerCanvas.composer = new EffectComposer(VisualizerCanvas.renderer)
      VisualizerCanvas.composer.addPass(new RenderPass(VisualizerCanvas.scene, VisualizerCanvas.camera))
      const afterimagePass = new AfterimagePass()
      VisualizerCanvas.composer.addPass(afterimagePass)

      this.changingMode = false
      this.animate()
    })
  }

  private animate () {
    this.animationID = requestAnimationFrame(this.animate)

    this.renderer()
  }

  private renderer () {
    if (this.SpotifyAnalysisUtils.loaded) {
      // Live Audio
      VisualizerCanvas.liveAudio.getData()

      if (!this.PlayerInfo.paused && !this.changingMode) {
        if (this.RandomColour) {
          this.changeColourKey()
        }

        if (this.RandomMode) {
          this.changeModeKey()
        }

        // Colour
        this.setColour(this.ColourKey, this.SpotifyAnalysisUtils)

        if (this.CameraRotateToggle) {
          this.rotateCamera()
        }
        if (this.CameraZoomToggle) {
          this.zoomCamera()
        }
        // Mode
        this.doMode(this.ModeKey, this.SpotifyAnalysisUtils)

        if (this.rotateShapeToggle) {
          for (let i = 0; i < VisualizerCanvas.shapeArr.length; i++) {
            this.rotateShape(VisualizerCanvas.shapeArr[i])
          }
        }
      } else {
        console.log('pausing player')
      }
    } else {
      console.log('no track features')
    }

    VisualizerCanvas.camera.updateProjectionMatrix()
    if (this.ModeKey > 3) {
      (VisualizerCanvas.composer.passes[1] as any).uniforms.damp.value = Math.min(0.88, VisualizerCanvas.liveAudio.snareObject.snareEnergy / 255)
      VisualizerCanvas.composer.render()
    } else if (this.ModeKey === 2) {
      (VisualizerCanvas.composer.passes[1] as any).uniforms.damp.value = Math.max(0.85, VisualizerCanvas.liveAudio.snareObject.snareEnergy / 255)
      VisualizerCanvas.composer.render()
    } else {
      (VisualizerCanvas.composer.passes[1] as any).uniforms.damp.value = Math.min(0.85, VisualizerCanvas.liveAudio.bassObject.bassEnergy / 255)
      VisualizerCanvas.composer.render()
    }
  }

  private mode1 (SpotifyAnalysisUtils: any) {
    let noiseFreq = 128
    if (SpotifyAnalysisUtils.trackFeatures.valence > 0.7) {
      noiseFreq = ((VisualizerCanvas.liveAudio.bassObject.bassAv - VisualizerCanvas.liveAudio.highsObject.highsAv) / (SpotifyAnalysisUtils.trackFeatures.energy * SpotifyAnalysisUtils.trackFeatures.danceability * SpotifyAnalysisUtils.trackFeatures.valence))
    } else if (SpotifyAnalysisUtils.trackFeatures.valence > 0.4) {
      noiseFreq = (VisualizerCanvas.liveAudio.bassObject.bassEnergy + VisualizerCanvas.liveAudio.kickObject.kickAv - VisualizerCanvas.liveAudio.snareObject.snareAv) / SpotifyAnalysisUtils.trackFeatures.energy
    } else if (SpotifyAnalysisUtils.trackFeatures.valence > 0.1) {
      noiseFreq = (VisualizerCanvas.liveAudio.snareObject.snareAv + VisualizerCanvas.liveAudio.kickObject.kickAv - VisualizerCanvas.liveAudio.highsObject.highsAv) / SpotifyAnalysisUtils.trackFeatures.danceability
    } else {
      noiseFreq = ((VisualizerCanvas.liveAudio.bassObject.bassEnergy + VisualizerCanvas.liveAudio.kickObject.kickAv - VisualizerCanvas.liveAudio.midsObject.midsAv - VisualizerCanvas.liveAudio.highsObject.highsEnergy) / SpotifyAnalysisUtils.trackFeatures.energy)
    }
    noiseFreq = Math.min(Math.max(noiseFreq, 128), 896)
    const zHeight = Math.min(Math.max((SpotifyAnalysisUtils.trackFeatures.energy * SpotifyAnalysisUtils.trackFeatures.danceability * (VisualizerCanvas.liveAudio.rms + VisualizerCanvas.liveAudio.highsObject.highsEnergy) / 3), 20), 80)
    const speed = (Date.now() + VisualizerCanvas.liveAudio.bassObject.bassEnergy + VisualizerCanvas.liveAudio.midsObject.midsEnergy) / Math.max((SpotifyAnalysisUtils.trackFeatures.tempo * SpotifyAnalysisUtils.trackFeatures.energy * SpotifyAnalysisUtils.trackFeatures.danceability * 20), 900)

    const shapeGeo = VisualizerCanvas.shapeArr[0].geometry as THREE.BufferGeometry
    const position = shapeGeo.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < position.count; i++) {
      const z = VisualizerCanvas.calcPlanePosition(position.getX(i), position.getY(i), noiseFreq, speed)
      position.setZ(i, z * zHeight)
    }

    shapeGeo.setAttribute('position', position)
    position.needsUpdate = true
    shapeGeo.computeVertexNormals()
    this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)

    if (SpotifyAnalysisUtils.barCounter >= 1) {
      const shapeMaterial = VisualizerCanvas.shapeArr[0].material as THREE.MeshLambertMaterialParameters
      VisualizerCanvas.noise = new SimplexNoise()
      shapeMaterial.wireframe = !shapeMaterial.wireframe
      shapeMaterial.flatShading = !shapeMaterial.wireframe
      // shapeMaterial.needsUpdate = true
      SpotifyAnalysisUtils.barCounter = 0
    }
  }

  private static calcPlanePosition (x: number, y: number, noiseFreq: number, speed: number) {
    return VisualizerCanvas.noise.noise3D(x / noiseFreq, y / noiseFreq, speed)
  }

  private mode2 (SpotifyAnalysisUtils: any) {
    if (VisualizerCanvas.shapeCloudArr.length > 0) {
      VisualizerCanvas.updateGenerativeTorus(SpotifyAnalysisUtils)
    }
    this.changeColourPoints(VisualizerCanvas.shapeCloudArr[0], VisualizerCanvas.shapeColour)
  }

  private mode3 (SpotifyAnalysisUtils: any) {
    let isWireframe = false
    if (VisualizerCanvas.shapeArr.length > 0) {
      isWireframe = (VisualizerCanvas.shapeArr[0].material as THREE.MeshPhongMaterial).wireframe
    }
    VisualizerCanvas.removeShape()
    this.addGenerativeSphere(SpotifyAnalysisUtils, isWireframe)
    // this.modifyGenerativeSphere(VisualizerCanvas.shapeArr[0])
    if (SpotifyAnalysisUtils.barCounter >= 1) {
      const shapeMaterial = VisualizerCanvas.shapeArr[0].material as THREE.MeshPhongMaterial
      shapeMaterial.wireframe = !shapeMaterial.wireframe
      shapeMaterial.flatShading = !shapeMaterial.wireframe
      SpotifyAnalysisUtils.barCounter = 0
    }
    this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)
  }

  private mode4 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.barCounter > 3) {
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 4]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 3]; i++) {
        this.changeColour(VisualizerCanvas.shapeArr[i], '0x0000')
      }
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 2]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i++) {
        this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
      }
    } else {
      if (SpotifyAnalysisUtils.beatCounter !== 0) {
        for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 1]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i++) {
          this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
        }
      }
      this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)
    }

    if (SpotifyAnalysisUtils.beatCounter > VisualizerCanvas.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
    }
  }

  private mode5 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.beatCounter > 3) {
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 4]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 3]; i = i + 2) {
        this.changeColour(VisualizerCanvas.shapeArr[i], '0x0000')
      }
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 2]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
        this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
      }
    } else {
      if (SpotifyAnalysisUtils.beatCounter !== 0) {
        for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 1]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
          this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
        }
      } else {
        this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)
      }
    }

    if (SpotifyAnalysisUtils.beatCounter > VisualizerCanvas.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
    }
  }

  private mode6 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.beatCounter > VisualizerCanvas.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
      for (let i = 0; i < VisualizerCanvas.shapeArr.length; i++) {
        this.changeColour(VisualizerCanvas.shapeArr[i], '0x0000')
      }
    } else {
      for (let i = 0; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
        this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
      }
    }
  }

  private mode7 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.tatumCounter - VisualizerCanvas.layerMarker[3] >= 0) {
      for (let i = 0; i < VisualizerCanvas.shapeArr.length; i++) {
        this.changeColour(VisualizerCanvas.shapeArr[i], '0x0000')
      }
    }
    for (let i = 0; i < 1 + (SpotifyAnalysisUtils.tatumCounter % VisualizerCanvas.layerMarker[3]); i++) {
      this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
    }
  }

  private doMode (key: number, SpotifyAnalysisUtils: any) {
    switch (key) {
      case 1:
        this.mode1(SpotifyAnalysisUtils)
        break
      case 2:
        this.mode2(SpotifyAnalysisUtils)
        break
      case 3:
        this.mode3(SpotifyAnalysisUtils)
        break
      case 4:
        this.mode4(SpotifyAnalysisUtils)
        break
      case 5:
        this.mode5(SpotifyAnalysisUtils)
        break
      case 6:
        this.mode6(SpotifyAnalysisUtils)
        break
      case 7:
        this.mode7(SpotifyAnalysisUtils)
        break
      default:
        this.$store.commit('mutateModeKey', 1)
        this.mode1(SpotifyAnalysisUtils)
    }
  }

  zoomCamera () {
    if (this.SpotifyAnalysisUtils.g_beats[this.SpotifyAnalysisUtils.g_beat] == null) {
      return
    }
    const beatConfidence = this.SpotifyAnalysisUtils.g_beats[this.SpotifyAnalysisUtils.g_beat].confidence
    const beatEnd = this.SpotifyAnalysisUtils.g_beats[this.SpotifyAnalysisUtils.g_beat].start + this.SpotifyAnalysisUtils.g_beats[this.SpotifyAnalysisUtils.g_beat].duration
    const zoomVal = ((Math.asin(VisualizerCanvas.liveAudio.bassObject.bassAv / 255) * (1 + this.SpotifyAnalysisUtils.trackFeatures.danceability)) + Math.asin(VisualizerCanvas.liveAudio.snareObject.snareAv / 255)) * this.SpotifyAnalysisUtils.trackFeatures.energy

    if (this.ModeKey > 2 && zoomVal > 0.8) {
      if (beatConfidence > 0.9) {
        if (this.SpotifyAnalysisUtils.g_bar % 2 === 0) {
          VisualizerCanvas.camera.zoom = zoomVal * (1 - (this.TrackTime / 1000 - beatEnd))
        } else {
          VisualizerCanvas.camera.zoom = zoomVal * (1 + this.TrackTime / 1000 - beatEnd)
        }
      } else {
        VisualizerCanvas.camera.zoom = zoomVal
      }
    } else {
      VisualizerCanvas.camera.zoom = 0.8
    }
  }

  rotateCamera () {
    const offset = 15000
    const time = Date.now() / (15000 * (1 - this.SpotifyAnalysisUtils.trackFeatures.energy))

    const rotationY = VisualizerCanvas.noise.noise2D(time - offset, time) / 2
    const rotationX = VisualizerCanvas.noise.noise2D(time, time + offset) / 3
    let rotationZ = 0

    if (this.ModeKey > 2) {
      if (this.SpotifyAnalysisUtils.g_beats[this.SpotifyAnalysisUtils.g_beat] && this.SpotifyAnalysisUtils.g_beats[this.SpotifyAnalysisUtils.g_beat].confidence > 0.85) {
        if (this.SpotifyAnalysisUtils.barCounter % 2 === 0) {
          rotationZ = (this.SpotifyAnalysisUtils.trackFeatures.tempo * VisualizerCanvas.liveAudio.bassObject.bassAv) / (500000)
        } else {
          rotationZ = -(this.SpotifyAnalysisUtils.trackFeatures.tempo * VisualizerCanvas.liveAudio.bassObject.bassAv) / (500000)
        }
      }
      VisualizerCanvas.camera.rotation.set(rotationX, rotationY, VisualizerCanvas.camera.rotation.z)
      VisualizerCanvas.camera.rotateZ(rotationZ)
    } else {
      VisualizerCanvas.camera.rotation.set(0, 0, 0)
    }
    // console.log(rotationX)
    // console.log(rotationY)
    // console.log(rotationZ)
  }

  rotateShape (shape: THREE.Mesh) {
    const spinf = VisualizerCanvas.liveAudio.frequencyData[VisualizerCanvas.freqKey]

    if (spinf > 150) {
      if (spinf > 200) {
        shape.rotation.x -= VisualizerCanvas.spinConstants[1]
        shape.rotation.y -= VisualizerCanvas.spinConstants[0]
        shape.rotation.z -= VisualizerCanvas.spinConstants[1]
      } else {
        shape.rotation.x -= VisualizerCanvas.spinConstants[2]
        shape.rotation.y -= VisualizerCanvas.spinConstants[1]
        shape.rotation.z -= VisualizerCanvas.spinConstants[2]
      }
    } else {
      if (spinf > 100) {
        shape.rotation.x -= VisualizerCanvas.spinConstants[3]
        shape.rotation.y += VisualizerCanvas.spinConstants[1]
        shape.rotation.z -= VisualizerCanvas.spinConstants[4]
      } else {
        shape.rotation.x -= VisualizerCanvas.spinConstants[4]
        shape.rotation.y += VisualizerCanvas.spinConstants[2]
        shape.rotation.z -= VisualizerCanvas.spinConstants[3]
      }
    }
  }

  private changeColourPoints (currShape: THREE.Points, currColour: string) {
    if (currShape.material instanceof THREE.Material) {
      const colour = new THREE.Color(parseInt(currColour))
      const params: THREE.PointsMaterialParameters = { color: colour }
      currShape.material.setValues(params)
    }
  }

  private changeColour (currShape: THREE.Mesh, currColour: string) {
    if (currShape.material instanceof THREE.Material) {
      const colour = new THREE.Color(parseInt(currColour))
      const params: THREE.MeshLambertMaterialParameters = { color: colour }
      currShape.material.setValues(params)
    }
  }

  private setColour (key: number, SpotifyAnalysisUtils: any) {
    switch (key) {
      case 1:
        VisualizerCanvas.shapeColour = this.hslToHex(SpotifyAnalysisUtils.g_timbre[2] * 2, SpotifyAnalysisUtils.g_timbre[1] * 2, SpotifyAnalysisUtils.g_timbre[0] * 3)
        break
      case 2:
        VisualizerCanvas.shapeColour = this.hslToHex((1 - SpotifyAnalysisUtils.g_timbre[2]) * 2, SpotifyAnalysisUtils.g_timbre[1] * 2, SpotifyAnalysisUtils.g_timbre[0] * 3)
        break
      case 3:
        VisualizerCanvas.shapeColour = this.hslToHex(SpotifyAnalysisUtils.g_timbre[1] * 2, VisualizerCanvas.liveAudio.bassObject.bassAv, SpotifyAnalysisUtils.g_timbre[0] * 3)
        break
      case 4:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.highsObject.highsEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy, VisualizerCanvas.liveAudio.snareObject.snareEnergy)
        break
      case 5:
        VisualizerCanvas.shapeColour = this.hslToHex(VisualizerCanvas.liveAudio.bassObject.bassEnergy, VisualizerCanvas.liveAudio.bassObject.bassAv + VisualizerCanvas.liveAudio.highsObject.highsEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy)
        break
      case 6:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.snareObject.snareEnergy, VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.highsObject.highsAv)
        break
      case 7:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.rms, VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.peak)
        break
      case 8:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.peak, VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.rms)
        break
      case 9:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.avFreq * 2, VisualizerCanvas.liveAudio.avFreq / 10, VisualizerCanvas.liveAudio.avFreq * 3)
        break
      case 10:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.frequencyData[13], VisualizerCanvas.liveAudio.frequencyData[9], VisualizerCanvas.liveAudio.frequencyData[5])
        break
      case 11:
        VisualizerCanvas.shapeColour = this.hslToHex(VisualizerCanvas.liveAudio.highsObject.highsEnergy * VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.bassObject.bassEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy)
        break
      case 12:
        VisualizerCanvas.shapeColour = this.hslToHex(VisualizerCanvas.liveAudio.avFreq + VisualizerCanvas.liveAudio.midsObject.midsAv, VisualizerCanvas.liveAudio.bassObject.bassAv, VisualizerCanvas.liveAudio.midsObject.midsAv)
        break
      default:
        VisualizerCanvas.shapeColour = VisualizerCanvas.rgbToHex(VisualizerCanvas.liveAudio.frequencyData[4], VisualizerCanvas.liveAudio.frequencyData[8], VisualizerCanvas.liveAudio.frequencyData[12])
    }
  }

  private setShapePosition () {
    let a = 0
    let f = 1
    let x = 0
    let y = 0
    let z = 0
    const distance = 40
    let shapeCount = 0
    const lim = 12

    // layer 0
    VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
    x = x + distance

    VisualizerCanvas.layerMarker[0] = 1

    // layer 1-<lim
    for (f; f < lim; f++) {
      for (a = 1; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        y = y - distance
      }
      for (a = 0; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        x = x - distance
      }
      for (a = 0; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        y = y + distance
      }
      for (a = -1; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        x = x + distance
      }

      VisualizerCanvas.layerMarker[f] = shapeCount
      console.log(shapeCount)
      z = z - distance + 10
    }
    console.log(VisualizerCanvas.layerMarker)
  }

  private static removeShape () {
    console.log('removing shapes')
    for (let i = 0; i < VisualizerCanvas.shapeArr.length; i++) {
      VisualizerCanvas.scene.remove(VisualizerCanvas.shapeArr[i])
      VisualizerCanvas.shapeArr[i].geometry.dispose()
      const material = VisualizerCanvas.shapeArr[i].material as THREE.Material
      material.dispose()
    }
    VisualizerCanvas.shapeArr = []

    for (let i = 0; i < VisualizerCanvas.shapeCloudArr.length; i++) {
      VisualizerCanvas.scene.remove(VisualizerCanvas.shapeCloudArr[i])
      VisualizerCanvas.shapeCloudArr[i].geometry.dispose()
      const material = VisualizerCanvas.shapeCloudArr[i].material as THREE.Material
      material.dispose()
    }
    VisualizerCanvas.shapeCloudArr = []
  }

  private static addOcean () {
    VisualizerCanvas.shapeArr.push(new THREE.Mesh(new THREE.PlaneBufferGeometry(window.innerWidth * 2, window.innerHeight * 2, 256, 256), new THREE.MeshLambertMaterial()))
    console.log(VisualizerCanvas.shapeArr)
    VisualizerCanvas.shapeArr[0].rotation.set(-Math.PI / 4, 0, Math.PI / 2)
    VisualizerCanvas.shapeArr[0].position.set(0, 0, -window.innerHeight / 4)
    VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[0])
    console.log('added ocean')
  }

  private addGenerativeSphere (SpotifyAnalysisUtils: any, isWireframe: boolean) {
    let segments = 1
    const chords: number[] = SpotifyAnalysisUtils.g_pitches.filter((pitch: number) => pitch > 0.5)
    if (chords.length > 0) {
      segments = chords.reduce((sum, currVal) => sum + currVal)
    }

    VisualizerCanvas.shapeArr.push(new THREE.Mesh(new THREE.SphereBufferGeometry(50, Math.ceil(segments * 3), Math.ceil(segments * 3), 0, Math.PI * 2, Math.sin(SpotifyAnalysisUtils.trackFeatures.tempo * (Date.now() / 1000000)) * Math.PI * 2, (VisualizerCanvas.liveAudio.avFreq / 255) * Math.PI * 2), new THREE.MeshPhongMaterial({ wireframe: isWireframe, flatShading: !isWireframe })))
    VisualizerCanvas.shapeArr[0].rotation.set(Math.PI / 2, 0, 0)
    VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[0])
  }

  private static updateGenerativeTorus (SpotifyAnalysisUtils: any) {
    let segments = 1
    const timbreArr: number[] = SpotifyAnalysisUtils.g_timbre
    const timbreSum = Math.ceil(timbreArr.reduce((sum, currVal) => sum + currVal) / (SpotifyAnalysisUtils.trackFeatures.energy * 30))
    const chords: number[] = SpotifyAnalysisUtils.g_pitches.filter((pitch: number) => pitch > 0.5)
    if (chords.length > 0) {
      segments = chords.reduce((sum, currVal) => sum + currVal)
    }

    VisualizerCanvas.shapeCloudArr[0].geometry = new THREE.TorusKnotBufferGeometry(VisualizerCanvas.liveAudio.midsObject.midsAv, VisualizerCanvas.liveAudio.highsObject.highsAv, VisualizerCanvas.liveAudio.bassObject.bassAv, Math.ceil(segments * 4), SpotifyAnalysisUtils.trackFeatures.danceability * 10, timbreSum)
  }

  private static addGenerativeTorus (SpotifyAnalysisUtils: any) {
    let segments = 1
    const timbreArr: number[] = SpotifyAnalysisUtils.g_timbre
    const timbreSum = Math.ceil(timbreArr.reduce((sum, currVal) => sum + currVal) / (SpotifyAnalysisUtils.trackFeatures.energy * 30))
    const chords: number[] = SpotifyAnalysisUtils.g_pitches.filter((pitch: number) => pitch > 0.5)
    if (chords.length > 0) {
      segments = chords.reduce((sum, currVal) => sum + currVal)
    }
    const TorusKnot = new THREE.TorusKnotBufferGeometry(VisualizerCanvas.liveAudio.midsObject.midsAv, VisualizerCanvas.liveAudio.highsObject.highsAv, VisualizerCanvas.liveAudio.bassObject.bassAv, Math.ceil(segments * 4), SpotifyAnalysisUtils.trackFeatures.danceability * 10, timbreSum)
    const material = new THREE.PointsMaterial({ color: 0xFFF, size: Math.min(Math.max(segments / 3, 1.5), 4), map: VisualizerCanvas.circleSprite, alphaTest: 0.5, transparent: true })
    VisualizerCanvas.shapeCloudArr.push(new THREE.Points(TorusKnot, material))
    VisualizerCanvas.scene.add(VisualizerCanvas.shapeCloudArr[0])
  }

  private static addShape (shapeType: number) {
    if (shapeType === 0) {
      const cubeGeo = new THREE.BoxGeometry(10, 10, 10)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(cubeGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new cube grid')
    } else if (shapeType === 1) {
      const octaGeo = new THREE.OctahedronGeometry(10, 0)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(octaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new octa grid')
    } else if (shapeType === 2) {
      const tetraGeo = new THREE.TetrahedronGeometry(10, 0)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(tetraGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new tetra grid')
    } else {
      const dodecaGeo = new THREE.DodecahedronGeometry(10, 0)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(dodecaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new dodeca grid')
    }
  }

  private static addLighting () {
    const pointLight = new THREE.PointLight(0xffffff)
    const spotLight = new THREE.SpotLight(0xffffff)

    pointLight.position.set(0, 0, window.innerHeight / 8)

    spotLight.position.set(0, -window.innerHeight / 2, window.innerHeight / 16)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = window.innerWidth * 2
    spotLight.shadow.mapSize.height = window.innerHeight * 2

    VisualizerCanvas.scene.add(pointLight)
    VisualizerCanvas.scene.add(spotLight)
  }

  private static rgbToHexHelper (num: number) {
    const hex = Math.ceil(num).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  private static rgbToHex (r: number, g: number, b: number) {
    return ('0x' + VisualizerCanvas.rgbToHexHelper(r) + VisualizerCanvas.rgbToHexHelper(g) + VisualizerCanvas.rgbToHexHelper(b))
  }

  private hslToHex (h: number, s: number, l: number) {
    h /= 360
    s /= 255
    l /= 255
    let r, g, b
    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `0x${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  private canvasResizeListener (el: Element) {
    window.addEventListener('resize', re => {
      const width = window.innerWidth
      const height = window.innerHeight
      VisualizerCanvas.camera.aspect = width / height
      VisualizerCanvas.renderer.setSize(width, height)
      VisualizerCanvas.renderer.setPixelRatio(window.devicePixelRatio)
      VisualizerCanvas.camera.updateProjectionMatrix()
    })
  }

  private changeColourKey () {
    if (this.SpotifyAnalysisUtils.changeColour) {
      const newColourKey = Math.floor(1 + Math.random() * 12)
      this.$store.commit('mutateColourKey', newColourKey)
      this.SpotifyAnalysisUtils.changeColour = false
      console.log(`changing colour key to ${newColourKey}`)
    }
  }

  private changeModeKey () {
    if (this.SpotifyAnalysisUtils.changeMode) {
      const newModeKey = Math.floor(1 + Math.random() * 7)
      this.$store.commit('mutateModeKey', newModeKey)
      this.SpotifyAnalysisUtils.changeMode = false
      console.log(`changing mode key to ${newModeKey}`)
    }
  }

  private static resetCamera () {
    VisualizerCanvas.camera.position.set(0, 0, 90)
    VisualizerCanvas.camera.rotation.set(0, 0, 0)
  }

  @Watch('ModeKey')
  onModeKeyChanged (mode: number, oldMode: number) {
    console.log(`changing mode key to ${mode} from ${oldMode}`)
    if (mode) {
      this.changingMode = true
      VisualizerCanvas.removeShape()
      VisualizerCanvas.resetCamera()
      if (mode === 1) {
        VisualizerCanvas.camera.position.set(0, -window.innerHeight / 8, 0)
        VisualizerCanvas.camera.rotation.set(0, Math.PI / 4, 0)
        VisualizerCanvas.addOcean()
        VisualizerCanvas.noise = new SimplexNoise()
        this.rotateShapeToggle = false
        VisualizerCanvas.scene.children[1].position.set(0, -window.innerHeight, 90)
      } else if (mode === 2) {
        VisualizerCanvas.addGenerativeTorus(this.SpotifyAnalysisUtils)
        this.rotateShapeToggle = false
        VisualizerCanvas.scene.children[1].position.set(0, -window.innerHeight / 2, 90)
      } else if (mode === 3) {
        this.addGenerativeSphere(this.SpotifyAnalysisUtils, false)
        VisualizerCanvas.scene.children[1].position.set(0, -window.innerHeight / 4, 0)
        this.rotateShapeToggle = false
      } else if (mode > 2) {
        VisualizerCanvas.addShape(Math.floor(Math.random() * 4))
        this.setShapePosition()
        this.rotateShapeToggle = true
        VisualizerCanvas.scene.children[1].position.set(0, -window.innerHeight / 2, 90)
      }
      this.changingMode = false
    }
  }
}
</script>

<style scoped>
.sceneContainer {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
}

.scene {
  width: 100%;
  height: 100%;
}

.btn.close {
  position: fixed;
  font-size: 2vw;
  top: 0;
  right: 0;
  opacity: 0.3;
  transition: all 0.5s;
}

.btn.close:hover {
  opacity: 1;
  border: 1px solid #FFF;
}
</style>
