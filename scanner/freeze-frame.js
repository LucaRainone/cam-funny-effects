// logic
getUserCamera().then(seeYourFace).then(makeFreezeEffectEngine);


// functions :)
async function getUserCamera() {
    return await navigator.mediaDevices.getUserMedia({video: true});
}

async function seeYourFace(stream) {
    const video = createVideo();
    video.srcObject = stream;
    let settings = stream.getTracks()[0].getSettings();
    let {width, height} = settings;

    const canvas = createCanvas();

    canvas.height = height
    canvas.width = width;

    drawVideoOnMyCanvas();
    document.body.appendChild(canvas);

    function drawVideoOnMyCanvas() {
        drawVideoOnCanvas({video, canvas});
        window.requestAnimationFrame(drawVideoOnMyCanvas);
    }

    return new Promise((res) => {
        setTimeout(() => res(canvas), 1000);
    })
}

function makeFreezeEffectEngine(canvas) {

    return new Promise(onEndFunction => {
        canvas.addEventListener('click', function() {
            let displayedCanvas = createCanvas();

            document.body.replaceChild(displayedCanvas, canvas);

            let position = 0;

            const ctx = displayedCanvas.getContext('2d');

            const drawPart = () => {
                ctx.drawImage(canvas, 0, position + 10, canvas.width, canvas.height - position - 10, 0, position, canvas.width, canvas.height - position - 10);
                drawLine(ctx, position, canvas.width);
                position++;
                if (position >= canvas.height - 10) {
                    onEndFunction(displayedCanvas);
                } else {
                    window.requestAnimationFrame(drawPart);
                }
            }
            drawPart();
        });

    });

}

function drawLine(ctx, position, width) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.rect(0, position + 2, width, 2);
    ctx.stroke();
}

function createVideo() {
    const video = document.createElement("VIDEO");
    video.setAttribute("autoplay", "true");
    return video;
}

function createCanvas() {
    const canvas = document.createElement("CANVAS");
    canvas.width = 640;
    canvas.height = 480;
    return canvas;
}

function drawVideoOnCanvas({video, canvas}) {
    canvas.getContext('2d').drawImage(video, 0, 0);
}
