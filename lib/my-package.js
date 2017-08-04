'use babel';

import {
    CompositeDisposable
} from 'atom';
import request from 'request'

export default {
    name163:null,
    subscriptions: null,
    audio: null,
    playList: null,
    playing: null,
    /**
     * 初次加载软件包调用
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    activate(state) {
        this.audio = document.createElement("audio");
        // this.playing = 0;
        this.playList = [];
        this.subscriptions = new CompositeDisposable();
        var self = this;
        this.audio.onended = function(){self.next()};
        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'my-package:toggle': () => this.toggle(),
            'my-package:next': () => this.next(),
            'my-package:play': () => this.play(),
            'my-package:pause': () => this.pause(),
            'my-package:list': () => this.list(),
            'my-package:getmusic': () => this.getmusic()
        }));
    },
    /**
     * 软件包停用调用，当用户关闭或者刷新编辑器的时候。
     * @return {[type]} [description]
     */
    deactivate() {
        this.subscriptions.dispose();
    },
    /**
     * 调用它在使用软件包的过程中保存软件包的当前状态。
     * 它的返回值会在 Atom
     * 下一次加载软件包的时候作为一个参数传递给 activate。
     * @return {[type]} [description]
     */
    serialize() {},


    toggle() {

        // this.getmusic();
        let editor
        if (editor = atom.workspace.getActiveTextEditor()) {
            let select = editor.getSelectedText();
            if(select){
                this.playList = [];
                this.search(select);
                this.next();
            }else {
                this.next();
            }
        }
    },
    next() {
        this.playing = this.playList[0];
        this.playList.shift();
        atom.notifications.addSuccess("当前播放："+this.playing.singerName+"--->"+this.playing.songName+
        (this.playing.timeLength/60.0).toFixed(2)+"分钟");
        atom.notifications.addSuccess("==========接下来歌曲==========");
        for(var key in this.playList)
        {
            atom.notifications.addSuccess(key+": "+this.playList[key].singerName+"--->"+
            this.playList[key].songName+"--"+(this.playList[key].timeLength/60.0).toFixed(2)+"分钟");
            if(key > 5)
                break;
        }
        this.play();
    },
    search(str) {
        var res = this.Ajax(this, "http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=" + encodeURI(str) +
            "&page=1&pagesize=50&showtype=1&callback=kgJSONP238513750<", this.fn);

    },

    fn(str) {
        var obj = JSON.parse(str);
        for (var key in obj.data.info) {
            this.Ajax(this, "http://m.kugou.com/app/i/getSongInfo.php?hash=" + obj.data.info[key].hash + "&cmd=playInfo", this.addMusic);
        }
    },
    addMusic(str) {
        var obj = JSON.parse(str);
        this.playList.push(obj);
    },

    play(){
        this.audio.src = this.playing.url;
        this.audio.play();
    },
    Ajax(self, url, fn) {
        var res;
        var obj = new XMLHttpRequest(); // XMLHttpRequest对象用于在后台与服务器交换数据
        obj.open('GET', url, false);
        obj.onreadystatechange = function() {
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState == 4说明请求已完成
                fn.call(self, obj.responseText); //从服务器获得数据
            }
        };
        obj.send();

    },
    pause(){
        atom.notifications.addSuccess("已暂停："+this.playing.singerName+"--->"+this.playing.songName);
        this.audio.pause();
    },
    list(){
        atom.notifications.addSuccess("当前播放："+this.playing.singerName+"--->"+this.playing.songName+"--"+
        (this.playing.timeLength/60.0).toFixed(2)+"分钟");
        for(var key in this.playList)
        {
            atom.notifications.addSuccess(key+": "+this.playList[key].singerName+"--->"+this.playList[key].songName+"--"+
            (this.playList[key].timeLength/60.0).toFixed(2)+"分钟");
        }
    },
    getmusic(){
        this.playList = [];
        var res = this.Ajax(this, "http://music.163.com/api/playlist/detail?id=867514742&updateTime=-1", this.getName);
    },
    getName(str){

        // alert(str);
        var obj = JSON.parse(str);

        this.name163 = [];
        for(var key in obj.result.tracks)
        {
            this.name163.push(obj.result.tracks[key].name)
            // this.search(obj.result.tracks[key].name);
        }
        this.getMusicUrl();
        // alert(this.name163);
    },
    getMusicUrl(){
        for(var key in this.name163){
            this.Ajax(this, "http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=" + encodeURI(this.name163[key]) +
                "&page=1&pagesize=50&showtype=1&callback=kgJSONP238513750<", this.getPlayUrl);
        }
    },
    getPlayUrl(str){
        var obj = JSON.parse(str);
        for(var key in obj.data.info)
        {
            this.Ajax(this, "http://m.kugou.com/app/i/getSongInfo.php?hash=" + obj.data.info[key].hash + "&cmd=playInfo", this.addMusic);
            if(key == 0)
                break;
        }


    }


//张学友 合久必婚 宫崎骏
};
