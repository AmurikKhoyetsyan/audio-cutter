/***********************************************************************
 *
 * Copyright (c) 2023 Amurik Khoyetsyan
 *
 * The MIT License (MIT)
 *
 ************************************************************************/

;(function () {
    /**
     * @type {{name: string, version: string}}
     */
    const AudioCutter = {
        name: 'Audio Cutter',
        version: '0.0.1'
    };

    /**
     * @type {{parent: null, canvas: null, ctx: null, bufferAudioData: null, audioContext: null, duration: null, rect: null, endX: null, isSelected: boolean, audio: null, startX: null, mask: null, option: {waveColor: string, playAfterCut: boolean, backgroundMask: string, callBack: null, name: string}}}
     */
    AudioCutter.defaultData = {
        parent: null,
        audio: null,
        audioContext: null,
        ctx: null,
        bufferAudioData: null,
        duration: null,
        canvas: null,
        isSelected: false,
        mask: null,
        rect: null,
        startX: null,
        endX: null,
        option: {
            waveColor: '#FFAA00',
            backgroundColor: '#FFFFFF',
            backgroundMask: 'rgba(232,109,109,0.42)',
            callBack: null,
            playAfterCut: false,
            isDownload: false,
            name: 'cut_audio.wav',
            removeContent: false,
            ekvalayzer: null,
            lineWidth: 2,
            waveOffset: 0.2,
            width: 460,
            height: 50,
        }
    };

    /**
     * @type {{}}
     */
    AudioCutter.fullData = {};

    /**
     * @param audio
     * @returns {Promise<unknown>}
     */
    AudioCutter.loadAudio = async function (audio = null) {
        let _self = this;

        audio = audio === null ? _self.fullData.audio : audio;

        return new Promise((resolve, reject) => {
            fetch(audio)
                .then(response => response.arrayBuffer())
                .then(data => _self.fullData.audioContext.decodeAudioData(data))
                .then(audioBuffer => {
                    resolve(audioBuffer);
                }).catch((err) => {
                console.log(err)
                reject(err);
            });
        });
    };

    /**
     *
     */
    AudioCutter.mousedown = function () {
        if (this.fullData.canvas !== null) {
            let _self = this;
            document.addEventListener('mousedown', (event) => {
                _self.fullData.isSelected = false;
                _self.fullData.mask.style['left'] = 0;
                _self.fullData.mask.style['width'] = 0;

                let position = _self.fullData.parent.getBoundingClientRect();

                if ((event.clientY >= position.y && event.clientY <= position.y + position.height) && (event.clientX >= position.x && event.clientX <= position.x + position.width)) {
                    _self.fullData.startX = (event.clientX - _self.fullData.rect.left) / _self.fullData.canvas.width * _self.fullData.duration;
                    _self.fullData.isSelected = true;
                } else {
                    _self.fullData.isSelected = false;
                }
            });
        }
    };

    /**
     *
     */
    AudioCutter.mouseup = function () {
        if (this.fullData.canvas !== null) {
            let _self = this;

            document.addEventListener('mouseup', (event) => {
                let position = _self.fullData.parent.getBoundingClientRect();

                if ((event.clientY >= position.y && event.clientY <= position.y + position.height) && (event.clientX >= position.x && event.clientX <= position.x + position.width)) {
                    _self.fullData.isSelected = false;
                } else {
                    _self.fullData.isSelected = false;
                }
            });
        }
    };

    /**
     *
     */
    AudioCutter.mousemove = function () {
        if (this.fullData.canvas !== null) {
            let _self = this;

            document.addEventListener('mousemove', (event) => {
                let position = _self.fullData.parent.getBoundingClientRect();

                if ((event.clientY >= position.y && event.clientY <= position.y + position.height) && (event.clientX >= position.x && event.clientX <= position.x + position.width)) {
                    if (_self.fullData.isSelected) {
                        _self.fullData.endX = (event.clientX - _self.fullData.rect.left) / _self.fullData.canvas.width * _self.fullData.duration;
                        if (_self.fullData.mask !== null) {
                            const maskWidth = (Math.abs(_self.fullData.endX - _self.fullData.startX) / _self.fullData.duration) * 100;
                            const maskLeft = (Math.min(_self.fullData.startX, _self.fullData.endX) / _self.fullData.duration) * 100;

                            _self.fullData.mask.style['left'] = maskLeft + '%';
                            _self.fullData.mask.style['width'] = maskWidth + '%';
                        }

                        if (_self.fullData.option.callBack !== null) {
                            _self.fullData.option.callBack(Math.min(_self.fullData.startX, _self.fullData.endX), Math.max(_self.fullData.startX, _self.fullData.endX));
                        }
                    }
                } else {
                    _self.fullData.isSelected = false;
                }
            });
        }
    };

    /**
     * @returns {Promise<void>}
     */
    AudioCutter.createWavForm = async function () {
        this.fullData.canvas = document.createElement('canvas');
        this.fullData.canvas.width = this.fullData.option.width;
        this.fullData.canvas.height = this.fullData.option.height;
        this.fullData.canvas.style['background-color'] = this.fullData.option.backgroundColor;
        this.fullData.parent.appendChild(this.fullData.canvas);
        this.fullData.ctx = this.fullData.canvas.getContext('2d');

        this.fullData.bufferAudioData = await this.loadAudio();

        this.fullData.ctx.fillStyle = this.fullData.option.waveColor;

        this.fullData.duration = this.fullData.bufferAudioData.duration;

        const channelData = this.fullData.bufferAudioData.getChannelData(0);
        const step = Math.ceil(channelData.length / this.fullData.canvas.width);
        const amp = this.fullData.canvas.height / 2.2;

        for (let i = 0; i < this.fullData.canvas.width; i += this.fullData.option.lineWidth) {
            const min = Math.min.apply(null, channelData.subarray(i * step, (i + 1) * step));
            const max = Math.max.apply(null, channelData.subarray(i * step, (i + 1) * step));
            this.fullData.ctx.fillRect(i, (this.fullData.canvas.height - Math.max(1, (max - min) * amp)) / 2, this.fullData.option.lineWidth - this.fullData.option.waveOffset, Math.max(1, (max - min) * amp));
        }

        this.fullData.rect = this.fullData.canvas.getBoundingClientRect();

        this.mousedown();
        this.mouseup();
        this.mousemove();
    }

    /**
     *
     */
    AudioCutter.createMask = function () {
        this.fullData.mask = document.createElement('div');
        this.fullData.mask.setAttribute('data-audio-cutter', true);

        this.fullData.mask.style['top'] = '0';
        this.fullData.mask.style['height'] = this.fullData.canvas.height + 'px';
        this.fullData.mask.style['position'] = 'absolute';
        this.fullData.mask.style['background-color'] = this.fullData.option.backgroundMask;

        this.fullData.parent.style['position'] = 'relative';

        this.fullData.parent.appendChild(this.fullData.mask);
    };

    /**
     * @param inputBuffer
     * @param start
     * @param end
     * @returns {AudioBuffer}
     */
    function cutAudioRemoveStartEnd(inputBuffer, start, end) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const channels = inputBuffer.numberOfChannels;
        const frameCount = Math.floor((end - start) * inputBuffer.sampleRate);
        const outputBuffer = audioContext.createBuffer(channels, frameCount, inputBuffer.sampleRate);

        for (let channel = 0; channel < channels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                const inputFrame = Math.floor((start + i / inputBuffer.sampleRate) * inputBuffer.sampleRate);
                outputData[i] = inputData[inputFrame];
            }
        }

        return outputBuffer;
    };

    /**
     * @param inputBuffer
     * @param start
     * @param end
     * @returns {AudioBuffer}
     */
    function cutAudioRemoveContent(inputBuffer, start, end) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const sampleRate = inputBuffer.sampleRate;
        const startSample = Math.floor(start * sampleRate);
        const endSample = Math.floor(end * sampleRate);

        const startSegment = inputBuffer.getChannelData(0).slice(0, startSample);
        const endSegment = inputBuffer.getChannelData(0).slice(endSample);

        const concatenatedData = new Float32Array(startSegment.length + endSegment.length);
        concatenatedData.set(startSegment, 0);
        concatenatedData.set(endSegment, startSegment.length);

        const concatenatedBuffer = audioContext.createBuffer(1, concatenatedData.length, sampleRate);
        concatenatedBuffer.getChannelData(0).set(concatenatedData);

        return concatenatedBuffer;
    };

    /**
     * @param buffer
     * @returns {Blob}
     */
    function bufferToWave(buffer) {
        const numberOfChannels = buffer.numberOfChannels;
        const length = buffer.length;
        const sampleRate = buffer.sampleRate;
        const interleaved = new Float32Array(length * numberOfChannels);
        const bufferData = [];

        for (let channel = 0; channel < numberOfChannels; channel++) {
            bufferData.push(buffer.getChannelData(channel));
        }

        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                interleaved[i * numberOfChannels + channel] = bufferData[channel][i];
            }
        }

        const dataLength = interleaved.length * 2;
        const headerLength = 44;
        const wav = new ArrayBuffer(headerLength + dataLength);
        const view = new DataView(wav);

        // RIFF identifier 'RIFF'
        view.setUint32(0, 1380533830, false);
        // file length excluding RIFF identifier
        view.setUint32(4, 36 + dataLength, true);
        // RIFF type 'WAVE'
        view.setUint32(8, 1463899717, false);
        // format chunk identifier 'fmt '
        view.setUint32(12, 1718449184, false);
        // format chunk length
        view.setUint32(16, 16, true);
        // sample format (1 means linear quantization)
        view.setUint16(20, 1, true);
        // number of channels
        view.setUint16(22, numberOfChannels, true);
        // sample rate
        view.setUint32(24, sampleRate, true);
        // byte rate (sample rate * block align)
        view.setUint32(28, sampleRate * 4, true);
        // block align (channels * bytes per sample)
        view.setUint16(32, numberOfChannels * 2, true);
        // bits per sample
        view.setUint16(34, 16, true);
        // data chunk identifier 'data'
        view.setUint32(36, 1684108385, false);
        // data chunk length
        view.setUint32(40, dataLength, true);

        // write the PCM samples
        let offset = 44;
        for (let i = 0; i < interleaved.length; i++, offset += 2) {
            view.setInt16(offset, interleaved[i] * 0x7FFF, true);
        }

        return new Blob([view], {type: 'audio/wav'});
    }

    /**
     * @param file
     * @param start
     * @param end
     */
    AudioCutter.cut = function (file = null, start = null, end = null, removeContent = null) {
        let _self = this;
        file = file === null ? _self.fullData.audio : file;

        start = start === null ? _self.fullData.startX : start;

        end = end === null ? _self.fullData.endX : end;

        removeContent = removeContent === null ? removeContent = _self.defaultData.option.removeContent : removeContent;

        return new Promise((resolve, reject) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const reader = new FileReader();

            reader.onload = function (e) {
                audioContext.decodeAudioData(e.target.result, function (buffer) {
                    const outputBuffer = removeContent ? cutAudioRemoveContent(buffer, start, end) : cutAudioRemoveStartEnd(buffer, start, end);

                    const source = audioContext.createBufferSource();
                    source.buffer = outputBuffer;
                    source.connect(audioContext.destination);

                    if (_self.fullData.option.playAfterCut) {
                        source.start();
                    }

                    const audioBlob = bufferToWave(outputBuffer);
                    const _url = URL || webkitURL;
                    const audioUrl = _url.createObjectURL(audioBlob);

                    if (_self.fullData.option.isDownload) {
                        const downloadLink = document.createElement('a');
                        downloadLink.href = audioUrl;
                        downloadLink.download = _self.fullData.option.name;
                        downloadLink.click();

                        downloadLink.remove();
                    }

                    resolve(audioUrl);
                });
            };

            reader.onerror = function (e) {
                reject(e);
            };

            reader.readAsArrayBuffer(file);
        });
    };

    /**
     *
     */
    AudioCutter.reset = function () {
        if (this.fullData.hasOwnProperty('canvas') && this.fullData.canvas !== null) {
            this.fullData.canvas.remove();
        }

        if (this.fullData.hasOwnProperty('mask') && this.fullData.mask !== null) {
            this.fullData.mask.remove();
        }

        this.fullData = {...this.defaultData};
    };

    /**
     * @param parent
     * @param audio
     * @param option
     */
    AudioCutter.run = function (parent = null, audio = null, option = {
        waveColor: null,
        backgroundMask: null,
        callBack: null,
        ekvalayzer: null
    }, ekvalayzer = {}) {

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
            this.createWavForm();
            this.createMask();

            if (this.fullData.option.ekvalayzer !== null) {
                EkvalayzerGraphic.run(this.fullData.option.ekvalayzer, audio, ekvalayzer);
            }
        }
    };

    window.AudioCutter = AudioCutter;
})();
