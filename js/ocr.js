// ocr.js - Tesseract OCR Engine

const OCRService = {
    
    currentWorker: null,
    
    // Text aus Bild scannen
    async recognize(imageData, language = 'deu+eng', onProgress) {
        try {
            // Worker erstellen
            const worker = await Tesseract.createWorker(language, 1, {
                logger: (msg) => {
                    if (msg.status === 'recognizing text') {
                        onProgress(Math.round(msg.progress * 100), 'Erkenne Text...');
                    } else if (msg.status === 'loading language traineddata') {
                        onProgress(10, `Lade Sprachdaten (${language})...`);
                    } else if (msg.status === 'initializing api') {
                        onProgress(20, 'Initialisiere OCR...');
                    }
                }
            });
            
            this.currentWorker = worker;
            onProgress(30, 'Verarbeite Bild...');
            
            // OCR ausführen
            const result = await worker.recognize(imageData);
            
            onProgress(90, 'Verarbeite Ergebnisse...');
            await worker.terminate();
            
            onProgress(100, 'Fertig!');
            
            return this.processResult(result);
            
        } catch (error) {
            throw new Error(`OCR Fehler: ${error.message}`);
        }
    },
    
    // Ergebnis verarbeiten
    processResult(tesseractResult) {
        const rawText = tesseractResult.data.text;
        const confidence = Math.round(tesseractResult.data.confidence);
        const words = tesseractResult.data.words || [];
        
        return {
            rawText: rawText.trim(),
            confidence: confidence,
            lines: this.extractLines(rawText),
            texts: this.extractTexts(rawText),
            numbers: this.extractNumbers(rawText),
            tableData: this.detectTable(rawText),
            wordCount: rawText.split(/\s+/).filter(w => w.length > 0).length,
            words: words
        };
    },
    
    // Zeilen extrahieren
    extractLines(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 1);
    },
    
    // Nur Text-Zeilen (keine reinen Zahlen)
    extractTexts(text) {
        const lines = this.extractLines(text);
        return lines.filter(line => {
            const numericOnly = /^[\d\s.,;:+\-€$£%/\\()]+$/.test(line);
            return !numericOnly && line.length > 1;
        });
    },
    
    // Alle Zahlen extrahieren
    extractNumbers(text, mode = 'all') {
        let pattern;
        switch(mode) {
            case 'decimal':
                pattern = /\b\d+[.,]\d+\b/g;
                break;
            case 'integer':
                pattern = /\b\d+\b/g;
                break;
            default:
                pattern = /-?\b\d+(?:[.,]\d+)?\b/g;
        }
        const matches = text.match(pattern) || [];
        return [...new Set(matches)]; // Duplikate entfernen
    },
    
    // Tabellenerkennung (einfach)
    detectTable(text) {
        const lines = this.extractLines(text);
        const tableRows = [];
        
        for (const line of lines) {
            // Leerzeichen-Trennung oder Tab-Trennung erkennen
            
