<template>
  <div class="home" @mousemove="showPlayer">
    <Player v-if="this.$store.state.authUser" :controlsToggle="playerToggle"></Player>
    <div v-if="!this.$store.state.openVisualizer">
      <HomeManager :key="this.$store.state.accessToken"/>
      <div v-if="this.$store.state.playerInfo">
        <transition-group class="home-container" name="fade">
          <OnlineUsers v-if="this.$store.state.user" :key="this.$store.state.authUser"/>
          <MyPlaylists v-if="this.$store.state.authUser" key="myPlaylistsContainer"/>
        </transition-group>
      </div>
    </div>
    <div v-else>
      <div v-if="this.$store.state.openVisualizer">
        <VisualizerCanvas v-if="this.$store.state.playerInfo" :controlsToggle="playerToggle"></VisualizerCanvas>
        <VisualizerControls v-if="this.$store.state.modeKey" :controlsToggle="playerToggle"></VisualizerControls>
      </div>
    </div>
  </div>
</template>

<script>
import HomeManager from '@/components/Home/HomeManager.vue'
import OnlineUsers from '@/components/ActiveUsers/ActiveUsersManager.vue'
import Player from '@/components/Player/Player.vue'
import MyPlaylists from '@/components/Playlists/MyPlaylists.vue'
import VisualizerCanvas from '@/components/Visualizer/VisualizerCanvas.vue'
import VisualizerControls from '@/components/Visualizer/VisualizerControls.vue'

export default {
  name: 'Home',
  components: {
    HomeManager,
    OnlineUsers,
    Player,
    MyPlaylists,
    VisualizerCanvas,
    VisualizerControls
  },
  data () {
    return {
      playerToggle: false,
      activityListener: null
    }
  },
  methods: {
    showPlayer () {
      console.log('showing player')
      this.playerToggle = true
      this.setActiveUser()
    },
    hidePlayer () {
      console.log('hiding player')
      this.playerToggle = false
    },
    setActiveUser () {
      clearTimeout(this.activityListener)
      this.activityListener = setTimeout(() => {
        this.hidePlayer()
      }, 3500)
    }
  }
}
</script>

<style scoped>
.home {
  padding: 0 0 10vh 0;
}
</style>
