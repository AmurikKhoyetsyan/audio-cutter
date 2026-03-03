;(function() {
    /**
     * @type {{name: string, version: string}}
     */
    let EkvalayzerGraphic = {
        name: 'Ekvalayzer Graphic',
        version: '0.0.1'
    };

    /**
     * @type {{audioContext: null, parent: null, canvas: null, ctx: null, bufferAudioData: null, audio: null, option: {}}}
     */
    EkvalayzerGraphic.defaultData = {
        parent: null,
        audio: null,
        audioPlayer: null,
        audioContext: null,
        ctx: null,
        bufferAudioData: null,
        canvas: null,
        frequencyArray: [],
        analyser: [],
        option: {
            backgroundColor: '#FFFFFF',
            color: '#445cf1',
            width: 460,
            height: 50,
            callback: null,
            lineWidth: 10,
            lineOffset: 0.2
        }
    };

    /**
     * @type {{}}
     */
    EkvalayzerGraphic.player = {};

    /**
     * @param callable
     */
    EkvalayzerGraphic.player.play = function (callable = null) {
        EkvalayzerGraphic.fullData.audioPlayer.play();

        if (callable !== null) {
            callable();
        }
    };

    /**
     * @param callable
     */
    EkvalayzerGraphic.player.pause = function (callable = null) {
        EkvalayzerGraphic.fullData.audioPlayer.pause();

        if (callable !== null) {
            callable();
        }
    };

    /**
     * @param callable
     */
    EkvalayzerGraphic.player.onend = function (callable = null) {
        EkvalayzerGraphic.fullData.audioPlayer.onended = function(event) {
            EkvalayzerGraphic.fullData.audioPlayer.pause();

            if (callable !== null) {
                callable();
            }
        };
    };

    /**
     * @type {{}}
     */
    EkvalayzerGraphic.fullData = {};

    /**
     *
     */
    EkvalayzerGraphic.createEkvalayzerGraphic = function() {
        this.fullData.ctx = null;
        let _self = this;

        /**
         *
         */
        function startAnimation() {
            if (_self.fullData.ctx !== null) {
                _self.fullData.ctx.clearRect(0, 0, _self.fullData.option.width, _self.fullData.option.height);
                _self.fullData.analyser.getByteFrequencyData(_self.fullData.frequencyArray);

                for (let i = 0; i < _self.fullData.option.width; i += _self.fullData.option.lineWidth) {
                    let x = i;
                    let y = _self.fullData.frequencyArray[i];
                    let xEnd = i;
                    let yEnd = _self.fullData.option.height
                    drawBar(x, y, xEnd, yEnd);
                }

                requestAnimationFrame(startAnimation);
            }
        }

        /**
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         */
        function drawBar(x1, y1, x2, y2) {
            _self.fullData.ctx.fillStyle = _self.fullData.option.color;
            let endY = (_self.fullData.option.lineWidth / 1.2) > y1 ? (_self.fullData.option.lineWidth / 1.2) : y1;
            _self.fullData.ctx.fillRect(x1, y2, _self.fullData.option.lineWidth - _self.fullData.option.lineOffset, -y1 / 4);
        }

        if (_self.fullData.parent !== null) {
            _self.fullData.canvas = document.createElement('canvas');
            _self.fullData.canvas.width = _self.fullData.option.width;
            _self.fullData.canvas.height = _self.fullData.option.height;
            _self.fullData.canvas.style['background-color'] = _self.fullData.option.backgroundColor;
            _self.fullData.ctx = _self.fullData.canvas.getContext("2d");

            _self.fullData.parent.appendChild(_self.fullData.canvas);

            startAnimation();

            if (_self.fullData.option.callBack !== null) {
                _self.fullData.option.callBack(EkvalayzerGraphic.player);
            }
        }
    };

    /**
     *
     */
    EkvalayzerGraphic.createEkvalayzer = function() {
        let _self = this;
        if (!_self.fullData.created) {
            _self.fullData.created = true;
            let context = new (window.AudioContext || window.webkitAudioContext)();
            _self.fullData.analyser = context.createAnalyser();
            let source = context.createMediaElementSource(_self.fullData.audioPlayer);
            source.crossOrigin = "anonymous";
            source.connect(_self.fullData.analyser);
            _self.fullData.analyser.connect(context.destination);
            _self.fullData.frequencyArray = new Uint8Array(_self.fullData.analyser.frequencyBinCount);

            _self.createEkvalayzerGraphic();
        }
    }

    /**
     * @param src
     */
    EkvalayzerGraphic.load = function(src) {
        let _self = this;

        fetch(src)
            .then(response => response.arrayBuffer())
            .then(audioData => {
                _self.fullData.audioContext = audioData;

                _self.fullData.audioPlayer = new Audio();
                _self.fullData.audioPlayer.crossOrigin = 'anonymous';
                _self.fullData.audioPlayer.src = src;
                _self.fullData.audioPlayer.controls = true;
                _self.fullData.audioPlayer.load();

                _self.createEkvalayzer(src);
            }).catch(err => {
            console.log(err);
        });
    };

    /**
     *
     */
    EkvalayzerGraphic.reset = function () {
        if (this.fullData.hasOwnProperty('canvas') && this.fullData.canvas !== null) {
            EkvalayzerGraphic.player.pause();
            this.fullData.canvas.remove();
        }

        this.fullData = {...this.defaultData};
    };

    /**
     * @param parent
     * @param audio
     * @param option
     */
    EkvalayzerGraphic.run = function (parent = null, audio = null, option = {}) {
        this.reset();

        this.fullData.parent = parent;
        this.fullData.audio = audio;
        this.fullData.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (Object.keys(option).length > 0) {
            for (let key in option) {
                this.fullData.option[key] = option[key];
            }
        }

        if (parent !== null && audio !== null) {
            this.load(audio);
        }
    }

    window.EkvalayzerGraphic = EkvalayzerGraphic;
})();