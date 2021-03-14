// logic
getUserCamera().then(seeYourFace).then(makeCircularEffectEngine);

let [WIDTH, HEIGHT] = [200, 200];

const getContainer = () => document.getElementById("cam");

// functions :)
async function getUserCamera() {
	try {
		return await navigator.mediaDevices.getUserMedia({video : true});
	} catch (e) {
		alert("No camera detected: " + e.toString());
	}
}

async function seeYourFace(stream) {
	const video = createVideo();

	video.srcObject     = stream;
	let settings        = stream.getTracks()[0].getSettings();
	let {width, height} = settings;

	const canvas = createCanvas();

	canvas.height = height
	canvas.width  = width;

	drawVideoOnMyCanvas();
	getContainer().appendChild(canvas);

	function drawVideoOnMyCanvas() {
		drawVideoOnCanvas({video, canvas});
		window.requestAnimationFrame(drawVideoOnMyCanvas);
	}

	return new Promise((res) => {
		setTimeout(() => res({canvas,width,height}), 1000);
	})
}

function buildMediaRecorder(canvas, onReady) {
	let videoStream               = canvas.captureStream(30);
	let mediaRecorder             = new MediaRecorder(videoStream);
	let chunks                    = [];
	mediaRecorder.ondataavailable = function (e) {
		chunks.push(e.data);
	};
	mediaRecorder.onstop          = function (e) {
		onReady(new Blob(chunks, {'type' : 'video/mp4'}));
		chunks = [];
	};
	return mediaRecorder;
}

function makeCircularEffectEngine({canvas, width, height}) {

	return new Promise(onEndFunction => {
		canvas.addEventListener('click', function () {

			let displayedCanvas = createCanvas(width, height);
			getContainer().replaceChild(displayedCanvas, canvas);

			const mediaRecorder = buildMediaRecorder(displayedCanvas, function (blob) {
				const videoObj = createVideo({withControls : true});
				videoObj.src   = URL.createObjectURL(blob);
				getContainer().replaceChild(videoObj, displayedCanvas);
				addDownloadButton(blob);
			});

			let radius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));

			const ctx = displayedCanvas.getContext('2d');
			mediaRecorder.start();
			const drawPart = () => {

				drawCanvasInsideCircle(ctx, canvas, radius);

				drawCircle(ctx, radius - 5, canvas);

				radius--;
				if (radius <= 0) {
					onEndFunction(displayedCanvas);
					mediaRecorder.stop()
				} else {
					window.requestAnimationFrame(drawPart);
				}
			}
			drawPart();
		});

	});

}

const getPositionFromIndex = (index, width) => {
	return {
		x : (index / 4 >> 0) % width,
		y : index / (width * 4) >> 0
	}
}

const getDistance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

function drawCanvasInsideCircle(ctx, canvas, radius) {
	let data       = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
	let origin     = {x : canvas.width / 2 >> 0, y : canvas.height / 2 >> 0};
	let targetData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < data.length; i += 4) {
		let pos = getPositionFromIndex(i, canvas.width);

		if (getDistance(origin, pos) < radius) {
			targetData.data[i]     = data[i];
			targetData.data[i + 1] = data[i + 1];
			targetData.data[i + 2] = data[i + 2];
			targetData.data[i + 3] = 255;

		}
	}

	ctx.putImageData(targetData, 0, 0);
}


function drawCircle(ctx, radius, canvas) {
	if (radius < 0)
		return;
	ctx.strokeStyle = "skyblue";
	ctx.beginPath();
	ctx.lineWidth = 4
	ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
	ctx.stroke();
}

function createVideo({withControls = false} = {}) {
	const video = document.createElement("VIDEO");
	video.setAttribute("autoplay", "true");
	if (withControls) {
		video.setAttribute("controls", "")
	}
	return video;
}

function createCanvas(width = WIDTH, height = HEIGHT) {
	const canvas  = document.createElement("CANVAS");
	canvas.width  = width;
	canvas.height = height;
	return canvas;
}

function drawVideoOnCanvas({video, canvas}) {
	canvas.getContext('2d').drawImage(video, 0, 0);
}

function addDownloadButton(blob) {
	const btn         = document.createElement("a");
	btn.style.display = "block";
	const reader        = new FileReader();
	reader.readAsDataURL(blob);
	btn.innerHTML    = "download";
	reader.onloadend = function () {
		btn.href       =  reader.result;
		btn.setAttribute("download", "download.mp4")
		getContainer().appendChild(btn);
	}

}