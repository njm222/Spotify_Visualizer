export default class AudioAnalyser {
  constructor() {
    this.bassObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      counter: 0,
      counterLimit: 32,
      arr: [],
      lower: 0,
      upper: 4,
    }
    this.kickObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      counter: 0,
      counterLimit: 64,
      arr: [],
      lower: 1,
      upper: 3,
    }
    this.snareObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      counter: 0,
      counterLimit: 64,
      arr: [],
      lower: 2,
      upper: 4,
    }
    this.midsObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      counter: 0,
      counterLimit: 64,
      arr: [],
      lower: 4,
      upper: 18,
    }
    this.highsObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      counter: 0,
      counterLimit: 64,
      arr: [],
      lower: 32,
      upper: 128,
    }
    this.avFreq = 0
    this.peak = 0
    this.rms = 0
    // Creates the context
    this.context = new AudioContext()
    // create analyser
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.9
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.bufferLength = this.analyser.frequencyBinCount
    this.analyser.minDecibels = -90
    this.analyser.maxDecibels = -25
    this.source = null

    if (navigator.mediaDevices.getUserMedia) {
      console.log('navigator.mediaDevices supported.')
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices = devices.filter((d) => d.kind === 'audiooutput')
          const constraints = { audio: { deviceId: 'default' } }
          navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            // attach source to the mic
            this.source = this.context.createMediaStreamSource(stream)
            // connect source to the analyser
            this.source.connect(this.analyser)
          })
        })
        .catch(function (err) {
          console.log('The following error occured: ' + err)
        })
    } else {
      console.log('getUserMedia not supported on your browser!')
    }
  }

  resetData() {
    this.avFreq = 0
    this.rms = 0
    this.peak = 0
    this.bassObject.average = 0
    this.bassObject.deviation = 0
    this.bassObject.energy = 0
    this.kickObject.average = 0
    this.kickObject.deviation = 0
    this.kickObject.energy = 0
    this.snareObject.average = 0
    this.snareObject.deviation = 0
    this.snareObject.energy = 0
    this.midsObject.average = 0
    this.midsObject.deviation = 0
    this.midsObject.energy = 0
    this.highsObject.average = 0
    this.highsObject.deviation = 0
    this.highsObject.energy = 0
  }

  updateData() {
    this.resetData()
    this.analyser.getByteFrequencyData(this.frequencyData)
    this.getFreqSection(this.bassObject)
    this.getFreqSection(this.kickObject)
    this.getFreqSection(this.snareObject)
    this.getFreqSection(this.midsObject)
    this.getFreqSection(this.highsObject)

    this.getAvFreq()
  }

  getFreqSection(sectionObject) {
    for (let i = sectionObject.lower; i < sectionObject.upper; i++) {
      sectionObject.energy += this.frequencyData[i]
    }
    sectionObject.energy =
      sectionObject.energy / (sectionObject.upper - sectionObject.lower)
    sectionObject.arr[sectionObject.counter++] = sectionObject.energy

    for (let i = 0; i < sectionObject.arr.length; i++) {
      sectionObject.average += sectionObject.arr[i]
      sectionObject.deviation += Math.pow(sectionObject.arr[i], 2)
    }

    sectionObject.average = sectionObject.average / sectionObject.arr.length
    sectionObject.deviation =
      Math.sqrt(sectionObject.deviation / sectionObject.arr.length) -
      sectionObject.average * sectionObject.average

    if (sectionObject.counter >= sectionObject.counterLimit) {
      sectionObject.counter = 0
    }
  }

  getAvFreq() {
    for (let i = 0; i < this.bufferLength; i++) {
      this.avFreq += this.frequencyData[i]
      this.rms += this.frequencyData[i] * this.frequencyData[i]
      if (this.frequencyData[i] > this.peak) {
        this.peak = this.frequencyData[i]
      }
    }
    this.avFreq = this.avFreq / this.bufferLength
    this.rms = Math.sqrt(this.rms / this.bufferLength)
  }
}
