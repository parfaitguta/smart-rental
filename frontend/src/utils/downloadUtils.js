// frontend/src/utils/downloadUtils.js
import * as XLSX from 'xlsx';

// Helper to handle nested accessors
const getValue = (obj, accessor) => {
  if (typeof accessor === 'function') {
    return accessor(obj);
  }
  return obj[accessor] || '';
};

// Export to CSV
export const exportToCSV = (data, filename, columns) => {
  const filteredData = data.map(row => {
    const newRow = {};
    columns.forEach((col, idx) => {
      newRow[col.header] = getValue(row, col.accessor);
    });
    return newRow;
  });
  
  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.csv`);
};

// Export to Excel
export const exportToExcel = (data, filename, columns) => {
  const filteredData = data.map(row => {
    const newRow = {};
    columns.forEach((col, idx) => {
      newRow[col.header] = getValue(row, col.accessor);
    });
    return newRow;
  });
  
  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, filename);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export to PDF - using browser print
export const exportToPDF = (data, filename, columns, title) => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          text-align: center;
        }
        .date {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #2563eb;
          color: white;
          padding: 10px;
          text-align: left;
          font-size: 12px;
        }
        td {
          border: 1px solid #ddd;
          padding: 8px;
          font-size: 11px;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="date">Generated on: ${new Date().toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td>${String(getValue(row, col.accessor) || '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Create a blob and open in new window for print/save as PDF
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  
  setTimeout(() => {
    if (printWindow) {
      printWindow.print();
    }
    URL.revokeObjectURL(url);
  }, 500);
};

// Export to Print
export const printData = (data, columns, title) => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2563eb; text-align: center; }
        .date { text-align: center; margin-bottom: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #2563eb; color: white; padding: 10px; text-align: left; font-size: 12px; }
        td { border: 1px solid #ddd; padding: 8px; font-size: 11px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        @media print {
          body { margin: 0; padding: 15px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="date">Generated on: ${new Date().toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td>${String(getValue(row, col.accessor) || '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>
        window.onload = () => { 
          setTimeout(() => {
            window.print(); 
            setTimeout(() => window.close(), 1000);
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};