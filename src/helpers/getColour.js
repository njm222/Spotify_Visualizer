import useStore from '@/helpers/store'
import hslToHex from './hslToHex'

const getColour = () => {
    const spotifyAnalyzer = useStore.getState().spotifyAnalyzer
    const audioAnalyzer = useStore.getState().audioAnalyzer
    if (!audioAnalyzer) { return '#FFF' }
    switch(useStore.getState().colourKey) {
        case 0:
            return hslToHex(
                audioAnalyzer.midsObject.average,
                audioAnalyzer.kickObject.average,
                audioAnalyzer.snareObject.average
                )
        case 1:
            return hslToHex(
                Math.abs(spotifyAnalyzer.timbre[1]),
                audioAnalyzer.midsObject.average,
                audioAnalyzer.bassObject.average,
                )
        default:
            return hslToHex(
                audioAnalyzer.highsObject.average,
                audioAnalyzer.snareObject.average,
                audioAnalyzer.kickObject.average
                )
    }
}

export default getColour