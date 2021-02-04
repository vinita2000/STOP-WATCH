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
// disable laps at the start
document.getElementById("laps").disabled = true;
document.getElementById('reset').disabled = true;

// global variables
let ms;
let sec;
let min;
let hr;
let time;
let isRunning = false;
let historyArr;
let totalLapsArr = [];
let timeDiff = [0, 0, 0];
let currLapsArr = [];

// formatting variables
let formattedms,
    formattedmin,
    formattedsec,
    formattedhr;

// store to session storage handler
function addTimeToLocalStorage() {
    let localItem = localStorage.getItem('timeArr');
    if (localItem === null) {
        let temp = [0, 0, 0, 0];
        localStorage.setItem('timeArr', JSON.stringify(temp));
        ms = 0;
        sec = 0;
        min = 0;
        hr = 0;
    }
}

// set local storage initially
function initializeHistArr() {
    let localItemHist = localStorage.getItem('historyArr');
    if (localItemHist === null) {
        const st = '00 : 00 : 00 : 00';
        historyArr = [
            st,
            st,
            st,
            st,
            st,
            st,
            st,
            st,
            st,
            st
        ];
        localStorage.setItem('historyArr', JSON.stringify(historyArr));
    } else {
        let histTemp = localStorage.getItem('historyArr');
        historyArr = JSON.parse(histTemp);
    }
}

// add laps to local storage
function getLapsArrFromLocal() {
    let localLaps = localStorage.getItem('currLapsArr');
    if (localLaps === null) {
        currLapsArr = [];
        localStorage.setItem('currLapsArr', JSON.stringify(currLapsArr));
    } else {
        let tempCurrlaps = localStorage.getItem('currLapsArr');
        currLapsArr = JSON.parse(tempCurrlaps);
    }
    // totalLapsArr = []
}

// store laps to local on beforeunload every time
function setLapsArrToLocal() {
    let localLaps = localStorage.getItem('currLapsArr');
    if (localLaps === null) {
        currLapsArr = [];
    }
    localStorage.setItem('currLapsArr', JSON.stringify(currLapsArr));
}


// update session storage
function updateTimeInLocalStorage() {
    let temp = [hr, min, sec, ms];
    localStorage.setItem('timeArr', JSON.stringify(temp));
}

// get time from local storage
function getTimeFromLocal() {
    let timeArrtemp = localStorage.getItem('timeArr');
    timeArr = JSON.parse(timeArrtemp);
    [hr, min, sec, ms] = timeArr;
}

// format timer
function formatTimer() {
    formattedms = ms < 10 ? `0` + ms : ms;
    formattedsec = sec < 10 ? `0` + sec : sec;
    formattedmin = min < 10 ? `0` + min : min;
    formattedhr = hr < 10 ? `0` + hr : hr;
}

// output formatter
function renderTimer() {
    formatTimer();
    // render to the page
    hour.innerText = formattedhr;
    minutes.innerText = formattedmin;
    seconds.innerText = formattedsec;
    milliseconds.innerText = formattedms;
}

// timer function
function timer() {
    ms++;
    if (ms >= 100) {
        ms = 0;
        sec++;
    }
    if (sec / 60 >= 1) {
        sec = 0;
        min++;
    }
    if (min / 60 >= 1) {
        min = 0;
        hr++;
    }
    // refresh the time after 24 hrs
    if (hr / 24 === 1) {
        ms = 0;
        sec = 0;
        min = 0;
        hr = 0;
    }
    // output time & formatting handler
    renderTimer();
    updateTimeInLocalStorage();
}

// enable reset and laps
function enableButtons() { // enable laps button
    document.getElementById("laps").disabled = false;
    document.getElementById('reset').disabled = false;
}

// start timer handler function
function startTimerHandler() {
    enableButtons();
    isRunning = true;
    document.getElementById('play').disabled = true;
    document.getElementById('stop').disabled = false;
    getTimeFromLocal();
    getBeforeAfterTime();
    // add time to hr, min, sec
    hr += timeDiff[0];
    min += timeDiff[1];
    sec += timeDiff[2];
    time = setInterval(timer, 10);
}

// stop the watch handler
function stopTimerHandler() { // clear the interval to freeze the time
    isRunning = false;
    document.getElementById('play').disabled = false;
    document.getElementById('stop').disabled = true;
    clearInterval(time);
}

// adds history data
function addToHistory() {
    let temp = localStorage.getItem('historyArr');
    let historyArrTemp = JSON.parse(temp);
    historyList.innerHTML = '';
    for (const log of historyArrTemp) {
        const histLog = `<li>${log}</li>`;
        historyList.innerHTML += histLog;
    }
}

// update history arr
function updateHistArr() {
    // store only last 10 laps at a time
    // store the laps and curr time
    let currHist = `${formattedhr} : ${formattedmin} : ${formattedsec} : ${formattedms}`;
    if (historyArr.length < 10) {
        historyArr.unshift(currHist);
    } else {
        historyArr.pop();
        historyArr.unshift(currHist);
    }
    // store hist arr to local storage
    localStorage.setItem('historyArr', JSON.stringify(historyArr));
    addToHistory();
}

// reset timer handler
function resetTimerHandler() {
    isRunning = false;
    document.getElementById('play').disabled = false;
    document.getElementById('stop').disabled = true;
    totalLapsArr = []; // empty total laps as well
    currLapsArr = [];
    totalLaps.innerHTML = `TOTAL : 00 : 00 : 00`;
    // add current lap to the history
    formatTimer();
    updateHistArr();

    ms = 0;
    sec = 0;
    min = 0;
    hr = 0;
    // clear the interval
    clearInterval(time);
    renderTimer();
    updateTimeInLocalStorage();
    // clear the laps as well
    lapList.innerHTML = '';
}
// converts seconds to min hr and seconds
function convertToHrMinSec(time) {
    let arr = [0, 0, 0];
    arr[0] = Math.floor(time / 3600);
    arr[1] = Math.floor((time % 3600) / 60);
    arr[2] = Math.ceil(time % 3600 % 60);
    return arr;
}

// calculates the total lap time in seconds
function calculateTotalLapTime() {
    let sum = totalLapsArr.reduce(function (a, b) {
        return a + b;
    }, 0);
    let time = convertToHrMinSec(sum);
    [h, m, s] = time;
    fs = s < 10 ? `0` + s : s;
    fm = m < 10 ? `0` + m : s;
    fh = h < 10 ? `0` + h : h;
    // render sum on the page
    totalLaps.innerHTML = `TOTAL : ${fh} Hrs ${fm} Min ${fs} Sec`;
}

// adds current lap time to lapsArr
function addCurrLaptoArr(temphr = hr, tempmin = min, tempsec = sec) { // convert to seconds
    let currTotal = temphr * 60 * 60 + tempmin * 60 + tempsec;
    totalLapsArr.push(currTotal);
    calculateTotalLapTime();
}

// adds single lap to arr
function updateCurrLapsArr() {
    currLapsArr.push([hr, min, sec]);
}

// renders laps in dom
function renderLapsInDom(currHr = formattedhr, currMin = formattedmin, currSec = formattedsec, currMs = formattedms) {
    let currentLap = `<li class="lapItem">
                        <p>${currHr} : ${currMin} : ${currSec} : ${currMs}</p>
                    </li>`;
    lapList.innerHTML += currentLap;
}

// render previous laps in dom
function renderPreviousLapsInDom(curr) {
    let tempHr = curr[0] < 10 ? `0` + curr[0] : curr[0];
    let tempMin = curr[1] < 10 ? `0` + curr[1] : curr[1];
    let tempSec = curr[2] < 10 ? `0` + curr[2] : curr[2];
    renderLapsInDom(tempHr, tempMin, tempSec, 0);
    //addPreviousLapsToTotalArr();
    addCurrLaptoArr(curr[0], curr[1], curr[2]);
}

// laps handler function
function lapsHandler() {
    formatTimer();
    addCurrLaptoArr();
    updateHistArr();
    updateCurrLapsArr();
    renderLapsInDom();
}

// find time difference before and after load
function calculateTimeDiff(beforeTime, afterTime) {
    for (let i = 0; i < beforeTime.length; i++) {
        timeDiff[i] = Math.abs(afterTime[i] - beforeTime[i]);
    }
}

// renders previously stored laps from local storage
function renderPreviousLaps() {
    if (currLapsArr.length) {
        for (const currLap of currLapsArr) {
            renderPreviousLapsInDom(currLap); // currLap is an array of time
        }
    }
}

// get before and after time from local
function getBeforeAfterTime() {
    let x = localStorage.getItem('beforeTimeArr');
    let y = localStorage.getItem('afterTimeArr');
    if (x === null || x === undefined || y === null || y === undefined) {
        console.log('It is your first time here');
    } else {
        let beforeTime = JSON.parse(x);
        let afterTime = JSON.parse(y);
        calculateTimeDiff(beforeTime, afterTime);
    }
}

// sets current watch state in local
function setWatchStateInLocal() {
    let temp = localStorage.getItem('isRunning');
    if (temp === undefined || temp === null) {
        localStorage.setItem('isRunning', 'false');
    } else {
        localStorage.setItem('isRunning', isRunning);
    }
}
// gets last stored watch state
function getWatchStateInLocal() {
    let temp = localStorage.getItem('isRunning');
    if (temp != undefined || temp != null) {
        isRunning = JSON.parse(temp);
    } else {
        isRunning = false;
    }
}

// before unload handler
function beforeunloadHandler() {
    setWatchStateInLocal();
    setLapsArrToLocal();
    let beforeTimeArr;
    if (isRunning) {
        let d = new Date();
        let time = d.getSeconds();
        beforeTimeArr = convertToHrMinSec(time);
    } else {
        beforeTimeArr = [0, 0, 0];
    }
    // store time to local storage
    localStorage.setItem('beforeTimeArr', JSON.stringify(beforeTimeArr));
}

// onload handler
function onloadHandler() {
    getWatchStateInLocal();
    getLapsArrFromLocal();
    renderPreviousLaps();
    let afterTimeArr;
    if (isRunning) {
        let d = new Date();
        let time = d.getSeconds();
        afterTimeArr = convertToHrMinSec(time);
        startTimerHandler();
    } else {
        afterTimeArr = [0, 0, 0];
        getTimeFromLocal();
        renderTimer();
    }
    // store time to local storage
    localStorage.setItem('afterTimeArr', JSON.stringify(afterTimeArr));
}

// set values to session initially
addTimeToLocalStorage();
// initialize history array in local storage
initializeHistArr();
addToHistory();

// adding event listeners
startTimer.addEventListener('click', startTimerHandler); // also change the button icon to pause
stopTimer.addEventListener('click', stopTimerHandler);
resetTimer.addEventListener('click', resetTimerHandler);
laps.addEventListener('click', lapsHandler);

// save time to local on refresh
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    beforeunloadHandler();
});

// save onload time
window.addEventListener('load', (e) => {
    e.preventDefault();
    onloadHandler();
});
