import { saveHistory } from "./firebase.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const startBtn = document.getElementById("startCamera");
const recognizeBtn = document.getElementById("recognizeBtn");
const stopBtn = document.getElementById("stopCamera");
const speakBtn = document.getElementById("speakBtn");
const saveBtn = document.getElementById("saveBtn");

const status = document.getElementById("cameraStatus");
const errorBox = document.getElementById("errorBox");

let stream = null;
let lastResult = null;

function showError(message) {
    console.error(message);

    if (errorBox) {
        errorBox.textContent = message;
    }
}

function clearError() {
    if (errorBox) {
        errorBox.textContent = "";
    }
}

async function startCamera() {
    clearError();

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API is not supported by this browser.");
        }

        status.textContent = "Requesting camera permission...";

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;

        await video.play();

        status.textContent = "Camera running";

        startBtn.disabled = true;
        recognizeBtn.disabled = false;
        stopBtn.disabled = false;

        console.log("Camera started successfully.");

    } catch (error) {
        console.error("Camera error:", error);

        status.textContent = "Camera failed";

        showError(
            "Camera access failed: " + error.message
        );
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });

        stream = null;
    }

    video.srcObject = null;

    status.textContent = "Camera stopped";

    startBtn.disabled = false;
    recognizeBtn.disabled = true;

    console.log("Camera stopped.");
}

async function recognizeSign() {
    clearError();

    if (!stream) {
        showError("Please start the camera first.");
        return;
    }

    try {
        status.textContent = "Processing...";

        const context = canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const image = canvas.toDataURL(
            "image/jpeg",
            0.82
        );

        const response = await fetch("/api/recognize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: image
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Recognition failed."
            );
        }

        lastResult = result;

        document.getElementById("resultLabel").textContent =
            result.label || "Unknown";

        document.getElementById("confidence").textContent =
            `${result.confidence || 0}%`;

        document.getElementById("confidenceBar").style.width =
            `${result.confidence || 0}%`;

        document.getElementById("fingerCount").textContent =
            result.finger_count ?? "—";

        document.getElementById("area").textContent =
            result.features?.area ?? "—";

        document.getElementById("solidity").textContent =
            result.features?.solidity ?? "—";

        const recognized = result.recognized === true;

        speakBtn.disabled = !recognized;
        saveBtn.disabled = !recognized;

        status.textContent = recognized
            ? "Sign detected"
            : "No recognized sign";

        console.log("Recognition result:", result);

    } catch (error) {
        console.error("Recognition error:", error);

        status.textContent = "Recognition error";

        showError(error.message);
    }
}

function speakResult() {
    if (!lastResult || !lastResult.recognized) {
        return;
    }

    if (!("speechSynthesis" in window)) {
        showError("Text-to-Speech is not supported.");
        return;
    }

    const text = lastResult.label;

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);
}

async function saveResult() {
    if (!lastResult || !lastResult.recognized) {
        return;
    }

    try {
        await saveHistory(lastResult);

        saveBtn.textContent = "Saved ✓";

        setTimeout(() => {
            saveBtn.textContent = "Save to History";
        }, 1200);

    } catch (error) {
        showError(error.message);
    }
}


/* =========================
   BUTTON EVENTS
========================= */

startBtn.addEventListener("click", startCamera);

recognizeBtn.addEventListener(
    "click",
    recognizeSign
);

stopBtn.addEventListener(
    "click",
    stopCamera
);

speakBtn.addEventListener(
    "click",
    speakResult
);

saveBtn.addEventListener(
    "click",
    saveResult
);

window.addEventListener(
    "beforeunload",
    stopCamera
);


/* =========================
   INITIAL STATE
========================= */

recognizeBtn.disabled = true;
stopBtn.disabled = false;

console.log(
    "SignVoice recognition.js loaded successfully."
);