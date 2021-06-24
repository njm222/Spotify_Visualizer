import useStore from '@/helpers/store'
import hslToHex from './hslToHex'

const getColour = () => {
    const spotifyAnalyzer = useStore.getState().spotifyAnalyzer
    const audioAnalyzer = useStore.getState().audioAnalyzer
    if (!audioAnalyzer) { return '#123456' }
    switch(useStore.getState().colourKey) {
        case 0:
            return hslToHex(
                audioAnalyzer.snareObject.energy * 5,
                audioAnalyzer.kickObject.average,
                audioAnalyzer.midsObject.energy,
            )
        case 1:
            return hslToHex(
                Math.abs(spotifyAnalyzer.timbre[2] * 2),
                audioAnalyzer.bassObject.energy,
                Math.abs(spotifyAnalyzer.timbre[0]),
            )
        case 3:
            return hslToHex(
                audioAnalyzer.midsObject.energy,
                audioAnalyzer.bassObject.average,
                audioAnalyzer.bassObject.energy
            )
        default:
            return hslToHex(
                audioAnalyzer.highsObject.energy * 10,
                audioAnalyzer.snareObject.average * 2,
                audioAnalyzer.kickObject.average * 2,
            )
    }
}

export default getColour