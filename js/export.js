// export.js - Excel & CSV Export

const ExportService = {

    // Excel (.xlsx) Export
    exportToExcel(scanResult, filename = 'TextScan') {
        const wb = XLSX.utils.book_new();

        // ── Sheet 1: Übersicht ──
        const overviewData = [
            ['TextScanner Pro - Export'],
            [''],
            ['Datum', new Date().toLocaleString('de-DE')],
            ['Dateiname', filename],
            ['Genauigkeit', `${scanResult.confidence}%`],
            ['Anzahl Wörter', scanResult.wordCount],
            ['Textzeilen', scanResult.texts.length],
            ['Zahlen gefunden', scanResult.numbers.length],
        ];
        const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
        wsOverview['!cols'] = [{ wch: 20 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, wsOverview, '📋 Übersicht');

        // ── Sheet 2: Vollständiger Text ──
        const rawLines = scanResult.rawText.split('\n').map(line => [line]);
        const wsRaw = XLSX.utils.aoa_to_sheet([['Erkannter Text'], ...rawLines]);
        wsRaw['!cols'] = [{ wch: 80 }];
        XLSX.utils.book_append_sheet(wb, wsRaw, '📄 Rohtext');

        // ── Sheet 3: Textzeilen ──
        const textData = [
            ['Nr.', 'Textzeile'],
            ...scanResult.texts.map((text, i) => [i + 1, text])
        ];
        const wsTexts = XLSX.utils.aoa_to_sheet(textData);
        wsTexts['!cols'] = [{ wch: 5 }, { wch: 70 }];
        XLSX.utils.book_append_sheet(wb, wsTexts, '📝 Texte');

        // ── Sheet 4: Zahlen ──
        const numberData = [
            ['Nr.', 'Zahl', 'Als Dezimal'],
            ...scanResult.numbers.map((num, i) => [
                i + 1,
                num,
                parseFloat(num.replace(',', '.')) || num
            ])
        ];
        const wsNumbers = XLSX.utils.aoa_to_sheet(numberData);
        wsNumbers['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsNumbers, '🔢 Zahlen');

        // ── Sheet 5: Tabelle (falls erkannt) ──
        if (scanResult.tableData && scanResult.tableData.length > 0) {
            const wsTable = XLSX.utils.aoa_to_sheet(scanResult.tableData);
            XLSX.utils.book_append_sheet(wb, wsTable, '📊 Tabelle');
        }

        // Datei speichern
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
    },

    // CSV Export
    exportToCSV(scanResult, filename = 'TextScan') {
        let csv = '\uFEFF'; // BOM für Excel
        csv += 'Typ;Inhalt\n';
        csv += `Datum;${new Date().toLocaleString('de-DE')}\n`;
        csv += `Genauigkeit;${scanResult.confidence}%\n\n`;

        csv += 'TEXTE\n';
        scanResult.texts.forEach((text, i) => {
            csv += `Text ${i + 1};"${text.replace(/"/g, '""')}"\n`;
        });

        csv += '\nZAHLEN\n';
        scanResult.numbers.forEach((num, i) => {
            csv += `Zahl ${i + 1};${num}\n`;
        });

        csv += '\nROHTEXT\n';
        csv += `"${scanResult.rawText.replace(/"/g, '""')}"\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const date = new Date().toISOString().slice(0, 10);
        this.downloadBlob(blob, `${filename}_${date}.csv`);
    },

    // Alle gespeicherten Scans exportieren
    exportAllToExcel(history) {
        const wb = XLSX.utils.book_new();

        // Übersichts-Sheet
        const summaryData = [
            ['Nr.', 'Datum', 'Textzeilen', 'Zahlen', 'Genauigkeit', 'Vorschau'],
            ...history.map((item, i) => [
                i + 1,
                new Date(item.date).toLocaleString('de-DE'),
                item.result.texts.length,
                item.result.numbers.length,
                `${item.result.confidence}%`,
                item.result.rawText.substring(0, 80)
            ])
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [
            { wch: 5 }, { wch: 20 }, { wch: 12 },
            { wch: 10 }, { wch: 12 }, { wch: 50 }
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Übersicht');

        // Pro Scan ein Sheet
        history.forEach((item, i) => {
            const sheetData = [
                ['Datum', new Date(item.date).toLocaleString('de-DE')],
                [''],
                ['Erkannte Texte'],
                ...item.result.texts.map(t => ['', t]),
                [''],
                ['Erkannte Zahlen'],
                ...item.result.numbers.map(n => ['', n]),
            ];
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            ws['!cols'] = [{ wch: 15 }, { wch: 60 }];
            XLSX.utils.book_append_sheet(wb, ws, `Scan ${i + 1}`);
        });

        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `Alle_Scans_${date}.xlsx`);
    },

    // Hilfsfunktion: Download
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};

