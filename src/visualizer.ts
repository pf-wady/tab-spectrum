import Chart from 'chart.js';
export {setCanvas, startDraw, stopDraw}

const defaultSampleRate = 44000;
const deufaltFFTSize = 2048;
const defaultFrequencyBinCount = deufaltFFTSize / 2;

let spectrumChart:Chart;
let dataLabel:number[];
let analyzedData:number[];

function setCanvas(canvas:HTMLCanvasElement){
    analyzedData = Array(defaultFrequencyBinCount).fill(0);
    spectrumChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dataLabel,
            datasets:[
                {
                    label: 'frequency',
                    data: analyzedData.map((v,i)=>({x:i*defaultSampleRate/deufaltFFTSize, y:v}))
                }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    position: 'bottom',
                    scaleLabel: {
                        labelString: 'Frequency',
                        display: true,
                    },
                    ticks: {
                        callback: function(tick){
                            if(typeof tick === 'string') return ''
                            const remain = tick / (Math.pow(10, Math.floor(Chart.helpers.log10(tick))));
                            if(remain ===1 || remain === 2 || remain === 5){
                                if(tick < 1000){
                                    return tick.toString() + 'Hz';
                                }else{
                                    return (tick / 1000).toString() + 'kHz';
                                }
                            }
                            return '';
                        }
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        labelString: 'Voltage',
                        display: true
                    },
                    ticks:{
                        min: 0,
                        max: 300
                    }
                }],
            },
            animation: {
                duration: 0
            }
        }
    });

}

function draw(chart:Chart, analyserNode:AnalyserNode) : void {
    const waveData = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(waveData);
    analyzedData = Array.from(waveData);

    chart.data.datasets?.forEach(dataset => {
        if(dataset.label = 'frequency'){
            dataset.data = analyzedData.map((v,i)=>({x:i*analyserNode.context.sampleRate/analyserNode.fftSize, y:v}));
        }
    })

    chart.update({duration:0});
    requestAnimationFrame(() => draw(spectrumChart, analyserNode));
}

function startDraw(analyserNode:AnalyserNode): number {
    return requestAnimationFrame(() => draw(spectrumChart, analyserNode));
}

function stopDraw(requestID:number) : void {
    cancelAnimationFrame(requestID);
}
