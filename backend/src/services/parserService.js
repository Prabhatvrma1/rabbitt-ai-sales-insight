const csvParser = require('csv-parser');
const XLSX = require('xlsx');
const { Readable } = require('stream');

/**
 * Parse a CSV buffer and return rows as array of objects.
 */
function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csvParser())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

/**
 * Parse an XLSX buffer and return rows as array of objects.
 */
function parseXlsxBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

/**
 * Parse uploaded file buffer and return a formatted data string for LLM consumption.
 */
async function parseFile(buffer, filename) {
  const ext = filename.toLowerCase().split('.').pop();
  let rows;

  if (ext === 'csv') {
    rows = await parseCsvBuffer(buffer);
  } else if (ext === 'xlsx') {
    rows = parseXlsxBuffer(buffer);
  } else {
    throw new Error('Invalid file type. Only .csv and .xlsx files are accepted.');
  }

  if (!rows || rows.length === 0) {
    throw new Error('The uploaded file contains no data.');
  }

  const columns = Object.keys(rows[0]);
  const summaryParts = [];

  // Basic info
  summaryParts.push(`Dataset: ${filename}`);
  summaryParts.push(`Total Rows: ${rows.length}`);
  summaryParts.push(`Columns: ${columns.join(', ')}`);
  summaryParts.push('');

  // Numeric summary
  const numericCols = columns.filter(col => {
    return rows.every(row => !isNaN(parseFloat(row[col])) && row[col] !== '');
  });

  if (numericCols.length > 0) {
    summaryParts.push('--- Numeric Summary ---');
    for (const col of numericCols) {
      const values = rows.map(row => parseFloat(row[col]));
      const total = values.reduce((a, b) => a + b, 0);
      const avg = total / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      summaryParts.push(
        `${col}: Total=${total.toLocaleString()}, Avg=${avg.toFixed(2)}, Min=${min.toLocaleString()}, Max=${max.toLocaleString()}`
      );
    }
    summaryParts.push('');
  }

  // Categorical breakdown
  const categoricalCols = columns.filter(col => !numericCols.includes(col));
  if (categoricalCols.length > 0) {
    summaryParts.push('--- Categorical Breakdown ---');
    for (const col of categoricalCols) {
      const counts = {};
      rows.forEach(row => {
        const val = row[col] || 'N/A';
        counts[val] = (counts[val] || 0) + 1;
      });
      summaryParts.push(`${col}: ${JSON.stringify(counts)}`);
    }
    summaryParts.push('');
  }

  // Raw data (first 50 rows)
  summaryParts.push('--- Raw Data (first 50 rows) ---');
  const headerLine = columns.join(' | ');
  summaryParts.push(headerLine);
  summaryParts.push('-'.repeat(headerLine.length));
  
  rows.slice(0, 50).forEach(row => {
    summaryParts.push(columns.map(col => row[col] ?? '').join(' | '));
  });

  return summaryParts.join('\n');
}

module.exports = { parseFile };
