import {setCanvas, startDraw, stopDraw} from "./visualizer";

const audioContext = new AudioContext();
const fftSize = 2048;
let playerStatus:boolean = false;
let requestID:number;
let audioStream:MediaStream|null = null;

// Main
const playButton = document.getElementById("playButton");
if(!(playButton instanceof HTMLButtonElement)){
    throw new Error("#playButton is not HTMLButtonElement");
}
const sampleRateDiv = document.getElementById("sampleRate");
if(!(sampleRateDiv instanceof HTMLParagraphElement)){
    throw new Error("#sampleRate is not HTMLParagraphElement");
}
const canvas = document.getElementById("audioCanvas");
if(!(canvas instanceof HTMLCanvasElement)){
    throw new Error("#audioCanvas is not HTMLCanvasElement");
}

sampleRateDiv.innerHTML += audioContext.sampleRate.toString();
setCanvas(canvas);

playButton.addEventListener("click", function(element){
    if(!playerStatus){
        // 再生
        chrome.tabCapture.capture({audio:true}, function(stream){
            if(stream){
                audioStream = stream;
                const source = audioContext.createMediaStreamSource(stream);
                const analyserNode = audioContext.createAnalyser();     
                analyserNode.fftSize = fftSize;
                source.connect(analyserNode);
                analyserNode.connect(audioContext.destination);
                
                requestID = startDraw(analyserNode);
                playerStatus = true;
                playButton.textContent = "stop"      
            }            
        });
    }else{
        // 停止
        stopDraw(requestID);
        audioStream!.getTracks().forEach(stream => {
            stream.stop();
        });    
        
        playerStatus = false;
        playButton.textContent = "start";
    }
});
