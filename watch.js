let time = 0; // Stopwatch time in seconds
let interval;
let running = false;
let laps = [];
let previousLapTime = 0;
let countdownTime = 0; // Countdown time in seconds
let countdownInterval;
let alertTime = null; // Alert time in seconds
let countdownRunning = false;

const display = document.getElementById("display");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const lapButton = document.getElementById("lap");
const downloadCSVButton = document.getElementById("download-csv");
const lapsList = document.getElementById("laps");
const countdownInput = document.getElementById("countdown");
const startCountdownButton = document.getElementById("start-countdown");
const pauseCountdownButton = document.getElementById("pause-countdown");
const alertInput = document.getElementById("alert-time");
const setAlertButton = document.getElementById("set-alert");
const alertMessage = document.getElementById("alert-message");
const alertSound = new Audio('path/to/your/alert-sound.mp3'); // Change to your alert sound file

loadStateFromLocalStorage();

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  display.innerText = formatTime(time);
}

function showAlert(message) {
  alertMessage.innerText = message;
  alertMessage.style.display = "block";
  setTimeout(() => {
    alertMessage.style.display = "none";
  }, 3000); // Hide after 3 seconds
}

function startStopwatch() {
  if (!running) {
    interval = setInterval(() => {
      time++;
      updateDisplay();

      // Trigger alert if set time is reached
      if (alertTime && time === alertTime) {
        alertSound.play(); // Play alert sound
        showAlert("Alert: You have reached the set time!");
        alertTime = null; // Reset alert time after triggering
      }
    }, 1000);
    running = true;
    saveStateToLocalStorage();
  }
}

function pauseStopwatch() {
  clearInterval(interval);
  running = false;
  saveStateToLocalStorage();
}

function resetStopwatch() {
  clearInterval(interval);
  time = 0;
  running = false;
  previousLapTime = 0;
  laps = [];
  updateDisplay();
  lapsList.innerHTML = '';
  clearLocalStorage();
  resetCountdownDisplay(); // Reset countdown when stopwatch resets
}

function recordLap() {
  const lapTime = time - previousLapTime;
  previousLapTime = time;
  laps.push(lapTime);
  const lapItem = document.createElement("li");
  lapItem.innerText = `Lap ${laps.length}: ${formatTime(time)} (Lap Time: ${formatTime(lapTime)})`;
  lapsList.appendChild(lapItem);
  saveStateToLocalStorage();
}

function startCountdown() {
  const countdownValue = parseInt(countdownInput.value);
  if (!isNaN(countdownValue) && countdownValue > 0) {
    countdownTime = countdownValue;
    countdownRunning = true;
    updateCountdownDisplay(); // Show the countdown time immediately
    countdownInterval = setInterval(() => {
      if (countdownTime > 0) {
        countdownTime--;
        updateCountdownDisplay();
      } else {
        clearInterval(countdownInterval);
        alertSound.play(); // Play alert sound when countdown finishes
        showAlert("Countdown finished!");
        countdownRunning = false;
        resetCountdownDisplay();
      }
    }, 1000);
  } else {
    showAlert("Please enter a valid positive number for the countdown.");
  }
}

function updateCountdownDisplay() {
  display.innerText = formatTime(countdownTime);
}

function resetCountdownDisplay() {
  display.innerText = "00:00:00"; // Reset display to initial state
  countdownTime = 0; // Reset countdown time
  countdownRunning = false; // Update state
}

function pauseCountdown() {
  clearInterval(countdownInterval);
  countdownRunning = false;
}

function setAlert() {
  const alertValue = parseInt(alertInput.value);
  if (!isNaN(alertValue) && alertValue >= 0) {
    alertTime = alertValue;
    showAlert(`Alert set at ${formatTime(alertTime)} seconds`);
  } else {
    showAlert("Please enter a valid non-negative time for the alert.");
  }
}

function saveStateToLocalStorage() {
  const state = {
    time,
    running,
    laps,
    previousLapTime,
    alertTime,
    countdownTime,
    countdownRunning,
  };
  localStorage.setItem("stopwatchState", JSON.stringify(state));
}

function loadStateFromLocalStorage() {
  const savedState = localStorage.getItem("stopwatchState");
  if (savedState) {
    const { time: savedTime, running: savedRunning, laps: savedLaps, previousLapTime: savedPreviousLapTime, alertTime: savedAlertTime, countdownTime: savedCountdownTime, countdownRunning: savedCountdownRunning } = JSON.parse(savedState);
    time = savedTime;
    laps = savedLaps;
    previousLapTime = savedPreviousLapTime;
    alertTime = savedAlertTime;
    countdownTime = savedCountdownTime;
    countdownRunning = savedCountdownRunning;

    updateDisplay();
    updateCountdownDisplay(); // Update display with saved countdown time

    laps.forEach((lap, index) => {
      const lapItem = document.createElement("li");
      lapItem.innerText = `Lap ${index + 1}: ${formatTime(lap)}`;
      lapsList.appendChild(lapItem);
    });
    if (savedRunning) {
      startStopwatch();
    }
    if (savedCountdownRunning) {
      startCountdown();
    }
  }
}

function clearLocalStorage() {
  localStorage.removeItem("stopwatchState");
}

function downloadCSV() {
  if (laps.length === 0) {
    showAlert("No lap times to download.");
    return;
  }
  
  let csvContent = "data:text/csv;charset=utf-8,Lap,Time\n";
  laps.forEach((lap, index) => {
    csvContent += `Lap ${index + 1},${formatTime(lap)}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "lap_times.csv");
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
}

// Event Listeners
startButton.addEventListener("click", startStopwatch);
pauseButton.addEventListener("click", pauseStopwatch);
resetButton.addEventListener("click", resetStopwatch);
lapButton.addEventListener("click", recordLap);
downloadCSVButton.addEventListener("click", downloadCSV);
startCountdownButton.addEventListener("click", startCountdown);
pauseCountdownButton.addEventListener("click", pauseCountdown);
setAlertButton.addEventListener("click", setAlert);
