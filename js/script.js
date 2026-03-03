function audioCuterLoad(audio) {
    let startTime = 0, endTime = 0;

    let selectInfo = document.querySelector('.selectionInfo');

    selectInfo.innerText = `Selected Range: Start ${startTime.toFixed(2)}s - End ${endTime.toFixed(2)}s`;

    document.querySelector('#cut').onclick = function (event) {
        AudioCutter.cut(audio.file, startTime, endTime).then(res => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    }

    AudioCutter.run(document.querySelector('.waveform'), audio.blob, {
            waveColor: '#FFAA00',
            backgroundMask: 'rgba(232,109,109,0.42)',
            playAfterCut: false,
            isDownload: true,
            name: 'download.wav',
            removeContent: true,
            lineWidth: 4,
            waveOffset: 1,
            ekvalayzer: document.querySelector('.ekvalayzer-graphic'),
            callBack: (start, end) => {
                startTime = start;
                endTime = end;

                selectInfo.innerText = `Selected Range: Start ${startTime.toFixed(2)}s - End ${endTime.toFixed(2)}s`;
            }
        },{
            lineOffset: 2,
            height: 50,
            color: '#4BC08B',
            callBack: (player) => {
                document.querySelector('.pause').onclick = function (event) {
                    player.pause();
                }
                document.querySelector('.play').onclick = function (event) {
                    player.play();
                }
            }
        });
}

DAD.fileChange({
    element: document.getElementById('addFile'),
    end: (res, err) => {
        if (err === null) {
            audioCuterLoad(res.files[0]);
        } else {
            console.log("Error ::: ", err);
        }
    }
});

DAD.draggedUpload({
    element: document.querySelectorAll(".input-label"),
    input: document.querySelector(".input-file"),
    end: (res, err) => {
        if (err === null) {
            audioCuterLoad(res.files[0]);
        } else {
            console.log("Error ::: ", err);
        }
    }
});
