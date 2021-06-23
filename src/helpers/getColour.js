import useStore from '@/helpers/store'
import hslToHex from './hslToHex'

const getColour = () => {
    const spotifyAnalyzer = useStore.getState().spotifyAnalyzer
    const audioAnalyzer = useStore.getState().audioAnalyzer
    if (!audioAnalyzer) { return '#123456' }
    switch(useStore.getState().colourKey) {
        case 0:
            return hslToHex(
                audioAnalyzer.snareObject.energy * 10,
                audioAnalyzer.kickObject.average * 10,
                audioAnalyzer.kickObject.energy * 10,
            )
        case 1:
            return hslToHex(
                Math.abs(spotifyAnalyzer.timbre[2] * 10),
                Math.abs(spotifyAnalyzer.timbre[0] * 10),
                Math.abs(spotifyAnalyzer.timbre[1] * 10),
            )
        case 3:
            return hslToHex(
                audioAnalyzer.midsObject.energy,
                audioAnalyzer.bassObject.average,
                audioAnalyzer.bassObject.energy
            )
        default:
            return hslToHex(
                audioAnalyzer.midsObject.average,
                audioAnalyzer.snareObject.average,
                audioAnalyzer.kickObject.average
            )
    }
}

export default getColour