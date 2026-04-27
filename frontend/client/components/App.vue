<template>
  <div id="app">
    <header class="nav-bar">
        <span class="main-header-info user" v-if="username">
            <i class="iconfont icon-user"></i>
            {{username}}
        </span>
        <span class="main-header-info time-clock">
            <i class="iconfont icon-time1"></i>
            {{nowTime}}
        </span>
        <span class="main-header-info refresh-window" @click="refreshWindow">
            <i class="iconfont icon-refresh"></i>
            {{$t('refresh')}}
        </span>
        <span class="main-header-info refresh-window" @click="switchLang">
            <i class="iconfont icon-zhongyingwenqiehuan-xianshizhongyingwen language"></i>
            {{$t('switchText')}}
        </span>
        <span class="main-header-info refresh-window" v-if="isElectron" @click="checkUpadte">
            <i class="iconfont icon-jianchagengxin language"></i>
            {{$t('checkUpdate')}}({{version}})
        </span>
        <div class="operate-area pull-right">
            <template v-if="username">
                <a href="javascript:void(0);" class="logout" @click="logout">{{$t('signOut')}}></a>
                <i class="iconfont icon-icon_shu shu"></i>
            </template>
            <i class="iconfont icon-jianhao" v-if="isElectron" @click="hideWindow"></i>
            <i class="iconfont icon-window" v-if="isElectron" @click="toggleWindowSize"></i>
            <i class="iconfont icon-guanbi1" v-if="isElectron" @click="closeWindow"></i>
        </div>
    </header>
    <router-view></router-view>
  </div>
</template>
<script>
import io from 'socket.io-client'
import { socketUrl } from 'common/js/api'
import { MessageBox, Message } from 'element-ui'
import { getNowFormatDate } from 'common/js/time'
import { removeStore, getStore, setStore } from 'common/js/storage'
import { loggedIn } from 'common/js/auth'
const pkg = require('../../package')

let ipcRenderer = null
let remote = null

const isElectron = typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron

if (isElectron) {
  try {
    const electron = window.require('electron')
    ipcRenderer = electron.ipcRenderer || (electron.remote && electron.remote.ipcRenderer)
    remote = electron.remote
  } catch (e) {
    console.log('Electron modules not available in web mode')
  }
}

export default {
    data () {
        return {
            mainWindow: null,
            nowTime: '',
            version: pkg.version,
            isElectron: isElectron
        }
    },
    created () {
        this.socket = io.connect(socketUrl)
        this.getLoginState()
        this.nowTimeCount()
        if (isElectron && remote) {
            this.mainWindow = remote.getCurrentWindow()
        }
    },
    methods: {
        getLoginState () {
            if (loggedIn()) {
                const storage = JSON.parse(getStore('userInfo'))
                this.$store.commit('UPDATEUSERINFO', {
                    username: storage.username,
                    store: storage.store,
                    storeid: storage.storeid,
                    src: storage.src,
                    room: storage.room
                })
            } else {
                this.$store.commit('UPDATEUSERINFO', {
                    username: null,
                    store: null,
                    storeid: null,
                    src: null,
                    room: null
                })
            }
        },
        hideWindow () {
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized()) {
                    return
                }
                this.mainWindow.minimize()
            }
        },
        toggleWindowSize () {
            if (this.mainWindow) {
                this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
            }
        },
        closeWindow () {
            if (ipcRenderer) {
                ipcRenderer.send('close-main-window')
            }
        },
        checkUpadte () {
            if (ipcRenderer) {
                ipcRenderer.send('check-for-update')
            }
        },
        logout () {
            const _self = this
            MessageBox.confirm(this.$t('logOutTip'), this.$t('prompt'), {
                confirmButtonText: this.$t('sure'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning'
            }).then(() => {
                const storage = JSON.parse(getStore('userInfo'))
                const obj = {
                    name: storage.username,
                    src: storage.src,
                    store: storage.store,
                    roomid: this.currentUserRoom
                }
                this.socket.emit('out', obj)
                removeStore('userInfo')
                Message({
                    type: 'success',
                    message: _self.$t('logOutSucess'),
                    duration: 1000,
                    onClose: function () {
                        _self.$store.commit('UPDATEUSERINFO', {
                            username: null,
                            store: null,
                            storeid: null,
                            src: null,
                            room: null
                        })
                        _self.$router.push({ path: '/login', query: { redirect: _self.$route.fullPath }})
                    }
                })
            }).catch(() => {

            })
        },
        refreshWindow () {
            if (this.mainWindow) {
                this.mainWindow.reload()
            } else {
                window.location.reload()
            }
        },
        switchLang () {
            if (this.$i18n.locale === 'en') {
                this.$i18n.locale = 'zh'
                setStore('language', 'zh')
                this.$store.commit('UPDATELANGUAGE', 'zh')
            } else {
                this.$i18n.locale = 'en'
                setStore('language', 'en')
                this.$store.commit('UPDATELANGUAGE', 'en')
            }
        },
        nowTimeCount () {
            const _self = this
            setInterval(() => {
                _self.nowTime = getNowFormatDate()
            }, 1000)
        }
    },
    computed: {
        username () {
            return this.$store.state.userInfo.username
        },
        currentUserRoom () {
            return this.$store.getters.getuserroom
        }
    }
}
</script>
<style lang="scss">
@import '../common/css/common.scss';
.nav-bar{
    height: 30px;
    background-color: #601e39;
    padding: 0 20px;
    -webkit-user-select: none;
    -webkit-app-region: drag;
    .operate-area,
    .refresh-window{
        -webkit-app-region: no-drag;
    }
    .main-header-info,
    .logout{
        color: #e0dcde;
        line-height: 30px;
        margin-right: 10px;
        text-shadow: 0 1px 1px #000;
        font-size: $size-base;
    }
    .refresh-window{
        cursor: pointer;
        margin-left: 40px;
        font-size: $size-h5;
    }
    .logout{
        vertical-align: top;
    }
    .iconfont{
        &:not(:last-of-type){
            margin-right: 10px;
        }
        &.shu{
            cursor: none;
            color: rgba(255,255,255, .2);
        }
        display: inline-block;
        color: $white;
        font-size: $size-base;
        cursor: pointer;
        vertical-align: top;
    }
    .operate-area{
        .iconfont{
            vertical-align: -webkit-baseline-middle;
        }
    }
    .time-clock,
    .user{
        font-size: $size-h5;
    }
    .language{
        font-size: $size-h2;
    }
    .time-clock{
        display: inline-block;
        width: 165px;
    }
}

@font-face {font-family: "iconfont";
  src: url(../common/font/iconfont.eot);
  src: url(../common/font/iconfont.eot#iefix) format('embedded-opentype'),
  url(../common/font/iconfont.woff) format('woff'),
  url(../common/font/iconfont.ttf) format('truetype'),
  url(../common/font/iconfont.svg#iconfont) format('svg');
}

.iconfont {
  font-family:"iconfont" !important;
  font-size:16px;
  font-style:normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-time1:before { content: "\e60b"; }

.icon-user:before { content: "\e64a"; }

.icon-refresh:before { content: "\e623"; }

.icon-jianchagengxin:before { content: "\e618"; }

.icon-guanbi1:before { content: "\e723"; }

.icon-jianhao:before { content: "\e729"; }

.icon-xiaoquxinwen:before { content: "\e600"; }

.icon-icon_shu:before { content: "\e63a"; }

.icon-window:before { content: "\e60e"; }

.icon-zhongyingwenqiehuan-xianshizhongyingwen:before { content: "\e669"; }
</style>
