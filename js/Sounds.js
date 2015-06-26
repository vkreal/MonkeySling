(function () {
    // TODO: HIRE SOMEONE TO FIX THIS MESS IF I MAKE ANY MONEY!!!!
    var soundManager = VK.importExternal('soundManager');
    var soundReady = false;
    soundManager['url'] = VK.APPLICATION_ROOT + 'soundmanager2/swf/soundmanager2.swf';
    soundManager['flashVersion'] = 9;
    soundManager['debugMode'] = false;
    soundManager['useHTML5Audio'] = true;
    soundManager['useHighPerformance'] = true;
    soundManager['flashLoadTimeout'] = 500;
    soundManager['audioFormats']['mp3']['required'] = false;
    soundManager['ontimeout'](function () {
        soundManager['preferFlash'] = false;
        soundManager['useHTML5Audio'] = true;
        soundManager['reboot']()
    });

    var isSnappedMode = false;


    PubSub.subscribe("/viewState/change/", this, function (args) {
        if (args['view'] == 'snapped') {
            isSnappedMode = true;
            if (soundReady && VK.GameHelper.isMusicEnabled()) {
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, { isMusicEnabled: false });
            }
        }
        else {
            isSnappedMode = false;
            if (soundReady && VK.GameHelper.isMusicEnabled()) {
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, { isMusicEnabled: true });
            }
        }
    });

    PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, this, function (args) {
        if (soundManager && soundManager['play'] && VK.GameHelper.isMusicEnabled() /*isFxEnabled()*/) {
            if (args.volume) {
                soundManager['play'](args.soundId, { 'volume': args.volume });
            }
            else {
                soundManager['play'](args.soundId);
            }
        }
    });
 
    PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, this, function (args) {
        if (args.isMusicEnabled === true) {
            if (level_background_sound_playing) {
                loopSound(level_background_sound);
            }
            else if (theme_playing) {
                loopSound2(theme_sound);
            }
        }
        else {
            theme_sound.stop();
            level_background_sound.stop();
        }
    });

    PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, this, function (args) {
        if (args.play == true && theme_playing) {
            return;
        }
        if (args.play == true) {
            theme_playing = true;
        }
        else {
            theme_playing = false;
        }
        if (!soundReady || !VK.GameHelper.isMusicEnabled()) {
            return;
        }
        if (theme_playing) {
            loopSound2(theme_sound);
        }
        else{
            theme_sound.stop();
        }
    });

    PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_PLAY_LEVEL_BACKGROUND_SOUND, this, function (args) {
        if (args.play == true) {
            level_background_sound_playing = true;
        }
        else {
            level_background_sound_playing = false;
        }
        if (!soundReady || !VK.GameHelper.isMusicEnabled()) {
            return;
        }
        if (level_background_sound_playing) {
            loopSound(level_background_sound);
        }
        else {
            level_background_sound.stop();
        }
    });
    
    var level_background_sound = null;
    var level_background_sound_playing = false;
    var theme_sound = null;
    var theme_playing = true;

    function loopSound2(sound) {
        if (theme_playing && VK.GameHelper.isMusicEnabled()) {
            sound.play({
                'volume': 60,
                'onfinish': function () {
                    loopSound2(sound);
                }
            });
        }
    };
    
    function loopSound(sound) {
        if (level_background_sound_playing && VK.GameHelper.isMusicEnabled()) {
            sound.play({
                'volume': 40,
                'onfinish': function () {
                    loopSound(sound);
                }
            });
        }
    };
    
    soundManager['onready'](function () {
        soundManager['createSound']({ id: 'streched', url: VK.APPLICATION_ROOT + 'assets/audio/streched.mp3' });
        soundManager['createSound']({ id: 'beep', url: VK.APPLICATION_ROOT + 'assets/audio/beep.mp3' });
        soundManager['createSound']({ id: 'balloon_pop', url: VK.APPLICATION_ROOT + 'assets/audio/balloon_pop.mp3' });
        soundManager['createSound']({ id: 'tnt_explosion', url: VK.APPLICATION_ROOT + 'assets/audio/tnt_explosion.mp3' });
        soundManager['createSound']({ id: 'star', url: VK.APPLICATION_ROOT + 'assets/audio/star.mp3' });
        soundManager['createSound']({ id: 'score_count', url: VK.APPLICATION_ROOT + 'assets/audio/score_count.mp3' });
        soundManager['createSound']({ id: 'block_destroyed', url: VK.APPLICATION_ROOT + 'assets/audio/block_destroyed.mp3' });
        soundManager['createSound']({ id: 'block_collision', url: VK.APPLICATION_ROOT + 'assets/audio/block_collision.mp3' });
        soundManager['createSound']({ id: 'hero_destroyed', url: VK.APPLICATION_ROOT + 'assets/audio/hero_destroyed.mp3' });
        soundManager['createSound']({ id: 'level_complete', url: VK.APPLICATION_ROOT + 'assets/audio/level_complete.mp3' });
        soundManager['createSound']({ id: 'level_failed', url: VK.APPLICATION_ROOT + 'assets/audio/level_failed.mp3' });
        //soundManager['createSound']({ id: 'catch_peg', url: VK.APPLICATION_ROOT + 'assets/audio/catch_peg.mp3' });
        soundManager['createSound']({ id: 'sling', url: VK.APPLICATION_ROOT + 'assets/audio/sling.mp3' });
        if (VK.isWinJS()) {
            theme_sound = soundManager['createSound']({ id: 'theme', url: VK.APPLICATION_ROOT + 'assets/audio/music_short.mp3' });
        }
        else {
            theme_sound = soundManager['createSound']({ id: 'theme', url: VK.APPLICATION_ROOT + 'assets/audio/music_short.mp3' });
        }
        level_background_sound = soundManager['createSound']({
            id: 'music', url: VK.APPLICATION_ROOT +
                (VK.isWinJS() ? 'assets/audio/ambient_jungle_win8.mp3' : 'assets/audio/ambient_jungle_web.mp3')
        });

        if (VK.GameHelper.isMusicEnabled() && !isSnappedMode) {
            theme_playing = true;
            loopSound2(theme_sound);
        }
        soundReady = true;
    });
})();