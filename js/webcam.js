
window.modelLoaded = false;
window.displaySize = null
window.stop = false;
window.detectionInterval = null;
window.videoEl;
//window.overlayEl;
window.captureCanvasEl;

$(document).ready(function() {
    window.videoEl = document.getElementById('inputVideo')
    //window.overlayEl = document.getElementById('overlay');
    window.captureCanvasEl = document.getElementById('captureCanvas');    
    run()
})

function showOverlay(message){
    $("#overlay-lock").show();
    $("#status-message").text(message);
}

function hideOverlay(){
    $("#overlay-lock").hide();
}

async function run() {
    showOverlay("Prepping Facial Recognition AI");
    console.log('run')
    // load the models
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    //await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    //await faceapi.nets.faceLandmark68Net.loadFromUri('/models')

    console.log('loaded')

    window.modelLoaded = true;
    window.videoEl.onplay = onPlay;

    // try to access users webcam and stream the images
    // to the video element
    
    
    navigator.getUserMedia(
        { video: {} },
        stream => videoEl.srcObject = stream,
        err => console.error(err)
    )
    hideOverlay();

}

function capture(videoEl, detections) {     
    captureCanvasEl.width = window.displaySize.width;
    captureCanvasEl.height = window.displaySize.height;
    captureCanvasEl.getContext('2d').drawImage(videoEl, 0, 0, captureCanvasEl.width,captureCanvasEl.height);  
    $(captureCanvasEl).css({
        "left" : (-1 * detections.box.x) + "px",
        "top" : (-1 * detections.box.y) + "px"
    });
    $("#faceCropper").width(detections.box.width)
    $("#faceCropper").height(detections.box.height)
    //document.getElementById("printresult").innerHTML = captureCanvasEl.toDataURL(); 
}

function stopTracking(){
    window.stop = true;
    console.log("stopping");
    window.videoEl.onplay = function(){};
    console.log("frame cleared");
}


async function onPlay() {
    console.log("frame");

    //return;
    if(window.modelLoaded){
        if(window.stop){
            console.log("stopped");
            return;  
        } 

        window.detectionInterval = setInterval(async () => {
            if(window.stop){
                clearInterval(window.detectionInterval);
                console.log("cleared");
            }
            if(window.displaySize == null){
                //console.log(videoEl.videoWidth, videoEl.videoHeight, videoEl.offsetWidth, videoEl.offsetHeight);
                window.displaySize = { width: videoEl.offsetWidth, height: videoEl.offsetHeight }
            }
            //faceapi.matchDimensions(overlayEl, window.displaySize)

            const detections = await faceapi
                .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 512 }))
                //.detectSingleFace(videoEl, new faceapi.SsdMobilenetv1Options({ minConfidence : 0.5 }))
                //.withFaceLandmarks()
            //console.log(JSON.stringify(detections));
            

            if(!window.stop && detections){
                console.log(detections);

                showOverlay("Verifying your face...");
                console.log("detected");
                stopTracking();

                if(true){
                    const resizedDetections = faceapi.resizeResults(detections, window.displaySize)
                    capture(videoEl, resizedDetections);
                    //const resizedDetections = faceapi.resizeResults(detections, window.displaySize)
                    //faceapi.draw.drawDetections('overlay', resizedDetections)    
                    //faceapi.draw.drawFaceLandmarks('overlay', resizedDetections)  
                }
                

                
            }
            
        }, 100)
    }

    

    //setTimeout(() => onPlay(videoEl))
}
