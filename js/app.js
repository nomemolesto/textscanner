// app.js - Hauptlogik

// ── Globale Variablen ──
let currentImage = null;
let currentResult = null;
let scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');

// ── App starten ──
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
    setupFileInputs();
    updateHistoryCount();
});

// ── Drag & Drop ──
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[0]</a>;
        if (file) handleFile(file);
    });
}

// ── File Inputs ──
function setupFileInputs() {
    document.getElementById('fileInput').addEventListener('change', (e) => {
        if (e.target.files<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[0]</a>) handleFile(e.target.files<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[0]</a>);
    });

    document.getElementById('cameraInput').addEventListener('change', (e) => {
        if (e.target.files<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[0]</a>) handleFile(e.target.files<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[0]</a>);
    });
}

// ── Kamera öffnen ──
function openCamera() {
    document.getElementById('cameraInput').click();
}

// ── Datei verarbeiten ──
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('❌ Bitte ein Bild auswählen (JPG, PNG, etc.)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = e.target.result;
        showPreview(currentImage);
    };
    reader.readAsDataURL(file);
}

//
