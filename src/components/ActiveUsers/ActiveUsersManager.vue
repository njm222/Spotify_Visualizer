<template>
    <div class="home-container-child">
      <div class="online-users-title">
        <transition name="fade" mode="out-in">
          <div v-if='onlineUsers'>
            <ActiveUsersTitle title="Online Users" :usersCount="onlineUsers.size"></ActiveUsersTitle>
          </div>
          <div v-else-if="lastOnlineUsers">
            <ActiveUsersTitle title="Last Online Users"></ActiveUsersTitle>
          </div>
          <div v-else>
            <ActiveUsersTitle title="Online Users" usersCount="?"></ActiveUsersTitle>
            <fingerprint-spinner
                    :animation-duration="1500"
                    :size="64"
                    color="#FFF"
            ></fingerprint-spinner>
          </div>
        </transition>
      </div>
      <div class="users-container">
        <transition name="fadeRight" mode="out-in">
          <div v-if="onlineUsers" key="onlineUsersContainer">
            <div class="each-user" v-for='(item) in onlineUsers.values()' :key='item.user'>
              <ActiveItem :user="item.user" :spotifyLink="item.spotifyLink"></ActiveItem>
              <LastPlayedItem :trackDetails="item.lastPlayed"></LastPlayedItem>
              <UserPlaylists :userID="item.user"></UserPlaylists>
            </div>
          </div>
          <div v-else-if="lastOnlineUsers" key="lastOnlineUsersContainer">
            <div class="each-user" v-for='(item, i) in Array.from(lastOnlineUsers.values()).reverse()' :key="item.user + i">
              <ActiveItem :user="item.user" :spotifyLink="item.spotifyLink" :lastOnline="item.lastOnline"></ActiveItem>
              <LastPlayedItem :trackDetails="item.lastPlayed"></LastPlayedItem>
              <UserPlaylists :userID="item.user"></UserPlaylists>
            </div>
          </div>
        </transition>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { firebaseRef } from '@/services/firebase-utils'
import { FingerprintSpinner } from 'epic-spinners'
import LastPlayedItem from './LastPlayedItem.vue'
import UserPlaylists from '../Playlists/UserPlaylists.vue'
import ActiveUsersTitle from './ActiveUsersTitle.vue'
import ActiveItem from './ActiveItem.vue'

@Component({
  components: { FingerprintSpinner, LastPlayedItem, UserPlaylists, ActiveUsersTitle, ActiveItem }
})
export default class OnlineUsers extends Vue {
  get user () {
    return this.$store.state.user
  }

  get onlineUsers () {
    return this.$store.getters.getOnlineUsers
  }

  get lastOnlineUsers () {
    return this.$store.getters.getLastOnlineUsers
  }

  get usersPlaylists () {
    return this.$store.getters.getUsersPlaylists
  }

  get toggleUsersPlaylists () {
    return this.$store.state.toggleUsersPlaylists
  }

  created () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      this.loadOnline()
      this.loadLastOnline()
    })
  }

  hideUserPlaylists (userID: string) {
    console.log(`hiding ${userID}'s playlists`)
    this.$store.commit('mutateUsersPlaylists', { key: userID, value: false })
  }

  private getOnlineUserPlaylists (userID: string) {
    console.log(`getting ${userID}'s playlists`)
    console.log(userID)
    Vue.axios.get(`https://api.spotify.com/v1/users/${userID}/playlists`, {
      headers: {
        Authorization: 'Bearer ' + this.$store.state.accessToken
      }
    }).then((response) => {
      console.log(response.data.items)
      const payload = {
        key: userID,
        value: response.data.items
      }
      this.$nextTick().then(() => {
        this.$store.commit('mutateUsersPlaylists', payload)
      })
    }).catch((error) => {
      console.log(error)
    })
  }

  loadOnline () {
    const onlineU = new Map<number, any>()
    firebaseRef.firebase.database().ref('users/').on('value', (snapshot: any) => {
      onlineU.clear()
      snapshot.forEach((user: any) => {
        if (this.user.id !== user.key) {
          const onlineUserData = {
            user: user.child('connections').val(),
            spotifyLink: user.child('spotifyLink').val(),
            lastPlayed: user.child('lastPlayed').val()
          }
          if (onlineUserData.user) {
            onlineU.set(onlineUserData.user, onlineUserData)
          } else {
            onlineU.delete(onlineUserData.user)
          }
        }
      })
      if (onlineU.size === 0) {
        this.$store.commit('mutateOnlineUsers', null)
        this.loadLastOnline()
      } else {
        this.$store.commit('mutateOnlineUsers', onlineU)
      }
      console.log(onlineU)
    })
  }

  loadLastOnline () {
    const lastOnlineU = new Map<number, any>()
    firebaseRef.firebase.database().ref('users/').orderByChild('lastOnline').limitToLast(11).on('value', (snapshot: any) => {
      lastOnlineU.clear()
      snapshot.forEach((user: any) => {
        if (this.user.id !== user.key) {
          const lastOnlineUserData = {
            user: user.key,
            spotifyLink: user.child('spotifyLink').val(),
            lastPlayed: user.child('lastPlayed').val(),
            lastOnline: user.child('lastOnline').val()
          }
          lastOnlineU.set(lastOnlineUserData.user, lastOnlineUserData)
        }
      })
      this.$store.commit('mutateLastOnlineUsers', lastOnlineU)
    })
  }
}
</script>

<style scoped>
.users-container {
  display: inline-flex;
  padding: 0 1.5em;
}

.each-user {
  display: flex;
  flex-direction: column;
  padding: 2em 0;
}

.each-user .item {
  text-align: start;
  padding-bottom: 1em;
  min-width: 300px;
  max-width: 50vw;
}
</style>
