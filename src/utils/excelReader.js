const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
    constructor(filePath) {
        // Allow overriding the Excel path via env var for local troubleshooting
        const primaryPath = process.env.API_DATA_PATH || filePath;
        let workbook;
        try {
            workbook = XLSX.readFile(primaryPath);
        } catch (e) {
            const help = 'Set environment variable API_DATA_PATH to point to a valid Excel file, or place apiData.xlsx in data/excel/';
            throw new Error(`Could not open Excel test data at ${primaryPath}: ${e.message}. ${help}`);
        }
        this.workbook = workbook;
    }

    /**
     * Get test data from a specific sheet
     * @param {string} sheetName - Name of the sheet to read
     * @returns {Array} Array of objects with column headers as keys
     */
    getTestData(sheetName) {
        const sheet = this.workbook.Sheets[sheetName];
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found in Excel file`);
        }
        return XLSX.utils.sheet_to_json(sheet);
    }

    /**
     * Get all sheet names from the workbook
     * @returns {Array} Array of sheet names
     */
    getSheetNames() {
        return this.workbook.SheetNames;
    }
}

module.exports = new ExcelReader(path.join(__dirname, '../../data/excel/apiData.xlsx'));
