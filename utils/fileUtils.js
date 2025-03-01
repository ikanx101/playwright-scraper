const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Generates a safe filename from a URL
 * @param {string} url - The URL to generate a filename from
 * @returns {string} A safe filename
 */
function getSafeFilename(url) {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');
    const pathname = parsedUrl.pathname.replace(/\//g, '_');
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    return `${domain}${pathname}_${timestamp}.html`;
}

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} dirPath - The directory path to ensure
 * @returns {boolean} True if the directory exists or was created
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Membuat direktori: ${dirPath}`);
        return true;
    }
    return false;
}

/**
 * Saves content to a file
 * @param {string} content - The content to save
 * @param {string} outputDir - The directory to save to
 * @param {string} filename - The filename to save as
 * @returns {string} The full path to the saved file
 */
function saveToFile(content, outputDir, filename) {
    ensureDirectoryExists(outputDir);
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    return filepath;
}

module.exports = {
    getSafeFilename,
    ensureDirectoryExists,
    saveToFile
}; 