const startTimer = document.getElementById('play');
const stopTimer = document.getElementById('stop');
const resetTimer = document.getElementById('reset');
const laps = document.getElementById('laps');
const hour = document.getElementById('hour');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');
const milliseconds = document.getElementById('milliseconds');
const lapList = document.getElementById('lapList');
const historyList = document.getElementById('historyList');
const totalLaps = document.getElementById('totalLaps');
//disable laps at the start
document.getElementById("laps").disabled = true;

//global variables 
let ms;
let sec;
let min;
let hr;
let time;
let isRunning = false;
let historyArr;
let totalLapsArr = [];

//formatting variables
let formattedms, formattedmin, formattedsec, formattedhr;

//store to session storage handler
function addToSessionStorage(){
    if(sessionStorage.length === 0){
        sessionStorage.setItem('ms', 0);
        sessionStorage.setItem('sec', 0);
        sessionStorage.setItem('min', 0);
        sessionStorage.setItem('hr', 0);
        ms=0;
        sec=0;
        min=0;
        hr=0;
    }
}

//set local storage initially
function initializeHistArr(){
    const st = '00 : 00 : 00 : 00';
    historyArr = [st, st, st, st, st, st, st, st, st, st];
    localStorage.setItem('historyArr', JSON.stringify(historyArr));
}

//update session storage
function updateSessionStorage(){
    sessionStorage.setItem('ms', ms);
    sessionStorage.setItem('sec', sec);
    sessionStorage.setItem('min', min);
    sessionStorage.setItem('hr', hr);
}

//format timer
function formatTimer(){
    formattedms = ms<10?`0`+ms : ms;
    formattedsec = sec<10?`0`+sec : sec;
    formattedmin = min<10?`0`+min : sec;
    formattedhr = hr<10?`0`+hr : hr;
}

//output formatter
function renderTimer(){
    formatTimer();
    //render to the page
    hour.innerText = formattedhr;
    minutes.innerText = formattedmin;
    seconds.innerText = formattedsec;
    milliseconds.innerText = formattedms;
}

//timer function
function timer(){
    ms++;
    if(ms >= 100){
        ms = 0;
        sec ++;
    }
    if(sec/60 === 1){
        sec = 0;
        min ++;
    }
    if(min/60 === 1){
        min = 0;
        hr ++;
    }
    //refresh the time after 24 hrs
    if(hr/24 === 1){
        ms = 0;
        sec = 0;
        min = 0;
        hr = 0;
    }
    //output time & formatting handler
    renderTimer();
    updateSessionStorage();
}

//start timer handler function
function startTimerHandler(){
    //enable laps button
    document.getElementById("laps").disabled = false;
    //set a interval for the timer
    if(isRunning){
        throw new Error('Timer is already running :|');
    }
    isRunning = true;
    let temp1 = sessionStorage.getItem('ms');
    let temp2 = sessionStorage.getItem('sec');
    let temp3 = sessionStorage.getItem('min');
    let temp4 = sessionStorage.getItem('hr');
    hr = parseInt(temp4);
    min = parseInt(temp3);
    sec = parseInt(temp2);
    ms = parseInt(temp1);
    time = setInterval(timer, 10);
}

//stop the watch handler
function stopTimerHandler(){
    //clear the interval to freeze the time
    if(!isRunning){
        throw new Error('Timer has already stopped :|');
    }
    isRunning = false;
    clearInterval(time);
}

//adds history data
function addToHistory(){
    let temp = localStorage.getItem('historyArr');
    let historyArrTemp = JSON.parse(temp);
    historyList.innerHTML = '';
    for(const log of historyArrTemp){
        const histLog = `<li>${log}</li>`;
        historyList.innerHTML += histLog;
    }
}

//update history arr
function updateHistArr(){
    //store only last 10 laps at a time
    let currHist = `${formattedhr} : ${formattedmin} : ${formattedsec} : ${formattedms}`;
    if(historyArr.length < 10){
        historyArr.unshift(currHist);
    }
    else{
        historyArr.pop();
        historyArr.unshift(currHist);
    }
    //store hist arr to local storage
    localStorage.setItem('historyArr', JSON.stringify(historyArr));
    addToHistory();
}

//reset timer handler
function resetTimerHandler(){
    isRunning = false;
    totalLapsArr = [];//empty total laps as well
    totalLaps.innerHTML = `TOTAL : 00 : 00 : 00`;
    //add current lap to the history
    formatTimer();
    updateHistArr();

    ms= 0;
    sec = 0;
    min = 0;
    hr = 0;
    //clear the interval
    clearInterval(time);
    renderTimer();
    updateSessionStorage();
    //clear the laps as well
    lapList.innerHTML = '';
}

//calculates the total lap time in seconds
function calculateTotalLapTime(){
    let sum = totalLapsArr.reduce(function(a, b){
        return a + b;
    }, 0);
    let h = Math.floor(sum / 3600);
    let m = Math.floor(sum % 3600 / 60);
    let s = Math.floor(sum % 3600 % 60);
    fs = s<10?`0`+s : s;
    fm = m<10?`0`+m : s;
    fh = h<10?`0`+h : h;
    //render sum on the page
    totalLaps.innerHTML = `TOTAL : ${fh} Hrs : ${fm} Min: ${fs} Sec`;
}

//adds current lap time to lapsArr
function addCurrLaptoArr(){
    //convert to seconds
    let currTotal = hr*60*60 + min*60 + sec;
    totalLapsArr.push(currTotal);
    calculateTotalLapTime(); 
}

//laps handler function
function lapsHandler(){
    formatTimer();
    addCurrLaptoArr();
    let currentLap = `<li class="lapItem">
                        <p>${formattedhr} : ${formattedmin} : ${formattedsec} : ${formattedms}</p>
                    </li>`;
    lapList.innerHTML += currentLap;
}

//set values to session initially
addToSessionStorage();
//initialize history array in local storage
initializeHistArr();
addToHistory();
//adding event listeners
startTimer.addEventListener('click', startTimerHandler);//also change the button icon to pause
stopTimer.addEventListener('click', stopTimerHandler);
resetTimer.addEventListener('click', resetTimerHandler);
laps.addEventListener('click', lapsHandler);
