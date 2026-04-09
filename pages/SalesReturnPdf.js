import {PermissionsAndroid, Platform, Share} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

/**
 * generateSalesReturnPDF
 *
 * Generates a PDF for a Sales Return record and triggers the system Share sheet.
 *
 * @param {object} params
 * @param {string}   params.cmpcode             - Company code (e.g. 'ICUP', 'ICELAB')
 * @param {string}   params.returnNo            - Sales Return number
 * @param {string}   params.returnDate          - Formatted return date string (dd/MM/yyyy)
 * @param {string}   params.customerName        - Customer name
 * @param {string}   params.customerAddress     - Customer address
 * @param {string}   params.salesMan            - Salesman name
 * @param {string}   params.reason              - Reason for return
 * @param {Array}    params.itemList            - Array of return line items
 * @param {Function} params.getCompanyname      - Helper: (cmpcode) => company display name
 * @param {Function} params.getTRNnumber        - Helper: (cmpcode) => TRN string
 * @param {Function} params.setPdfUri           - State setter for pdf URI (optional, for preview)
 * @param {Function} params.resultClosePress    - Callback after PDF generation completes
 */
export const generateSalesReturnPDF = async ({
  cmpcode,
  returnNo,
  returnDate,
  customerName,
  customerAddress,
  salesMan,
  reason,
  itemList,
  getCompanyname,
  getTRNnumber,
  setPdfUri,
  resultClosePress,
}) => {
  // ── Android storage permission ───────────────────────────────────────────
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to save the PDF',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  }

  // ── Derived totals ────────────────────────────────────────────────────────
  const subTotal = itemList
    ? itemList.reduce((acc, item) => acc + (parseFloat(item.LINE_TOTAL) || 0), 0)
    : 0;
  const vatAmount = subTotal * 0.05;
  const grandTotal = subTotal + vatAmount;
  const totalQty = itemList
    ? itemList.reduce((acc, item) => acc + (parseFloat(item.QTY) || 0), 0)
    : 0;

  const fmt = (n, decimals = 2) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);

  const companyName = getCompanyname
    ? getCompanyname(cmpcode?.trim().toUpperCase())
    : cmpcode;
  const trnNumber = getTRNnumber
    ? getTRNnumber(cmpcode?.trim().toUpperCase())
    : '-';

  // ── Company header block (generic — add more cmpcode branches as needed) ──
  const companyHeaderHtml = `
    <div style="text-align:center; padding: 10px 0 6px 0;">
      <div style="font-size:22px; font-weight:bold; font-family:'Calibri',sans-serif;">
        ${companyName}
      </div>
      <div style="font-size:13px; font-family:'Calibri',sans-serif; margin-top:4px;">
        ${
          cmpcode?.toUpperCase().trim() === 'ICUP'
            ? 'Warehouse 23, First Industrial Area, Jebel Ali, Dubai.<br/>Tel: +971 547642223 , +971 43264233'
            : cmpcode?.toUpperCase().trim() === 'ICELAB'
            ? 'Central Plaza 2, Al Jurf, Ajman, UAE<br/>Tel: 065617700'
            : cmpcode?.toUpperCase().trim() === 'MESHARI'
            ? '21 Street, Al Qusais Ind, Area.1 | PO Box: 20875<br/>Ph: 04 3700924'
            : ''
        }
      </div>
      <div style="font-size:12px; font-weight:bold; margin-top:4px;">TRN: ${trnNumber}</div>
    </div>
  `;

  // ── Item rows HTML ────────────────────────────────────────────────────────
  const itemRowsHtml = itemList
    ? itemList
        .map(
          (item, index) => `
      <tr>
        <td style="width:6%; text-align:center;">${index + 1}</td>
        <td style="width:18%;">${item.ITEM_CODE || '-'}</td>
        <td style="width:28%;">${item.DESCRIPTION || '-'}</td>
        <td style="width:10%; text-align:center;">${fmt(item.QTY, 3)}</td>
        <td style="width:10%; text-align:right;">${fmt(item.PRICE || 0)}</td>
        <td style="width:10%; text-align:right;">${fmt(item.LINE_TOTAL || 0)}</td>
        <td style="width:9%; text-align:right;">${fmt((item.LINE_TOTAL || 0) * 0.05)}</td>
        <td style="width:9%; text-align:right;">${fmt((item.LINE_TOTAL || 0) * 1.05)}</td>
      </tr>`,
        )
        .join('')
    : '';

  // ── Full HTML document ────────────────────────────────────────────────────
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin: 0;
    padding: 0;
    background: white;
    font-family: 'Calibri', sans-serif;
    font-size: 13px;
    color: #222;
  }

  .page {
    width: 100%;
    padding: 10px 20px;
    box-sizing: border-box;
  }

  /* ── Title band ── */
  .title-band {
    background-color: #4B5290;
    color: white;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    padding: 6px 0;
    border-radius: 4px;
    margin: 8px 0;
    letter-spacing: 2px;
  }

  /* ── Info grid ── */
  .info-grid {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 8px 12px;
    margin-bottom: 10px;
    gap: 12px;
  }
  .info-col { flex: 1; }
  .info-row { display: flex; margin-bottom: 4px; }
  .info-label { font-weight: bold; min-width: 110px; font-size: 12px; }
  .info-value { font-size: 12px; color: #333; }
  .reason-tag {
    display: inline-block;
    background: #FFF3CD;
    border: 1px solid #FFC107;
    border-radius: 3px;
    padding: 1px 6px;
    font-size: 11px;
    color: #856404;
  }

  /* ── Items table ── */
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 0;
  }
  thead tr {
    background-color: #4B5290;
    color: white;
  }
  th {
    padding: 7px 6px;
    font-size: 12px;
    text-align: left;
    border: 1px solid #3a4170;
  }
  td {
    padding: 6px;
    font-size: 12px;
    border: 1px solid #ddd;
    color: #333;
  }
  tr:nth-child(even) td { background-color: #f7f8ff; }

  /* ── Totals ── */
  .totals-wrap {
    display: flex;
    justify-content: flex-end;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 5px 5px;
    padding: 8px 12px;
    margin-bottom: 10px;
    page-break-inside: avoid;
  }
  .totals-table { width: 45%; }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    font-size: 13px;
    border-bottom: 1px dashed #ddd;
  }
  .total-row.grand {
    font-weight: bold;
    font-size: 15px;
    color: #4B5290;
    border-bottom: none;
    margin-top: 4px;
  }

  /* ── Footer signatures ── */
  .footer-sig {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    padding: 0 12px;
  }
  .sig-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 130px;
  }
  .sig-line {
    width: 130px;
    border-bottom: 1px solid #555;
    margin-bottom: 4px;
    height: 28px;
  }
  .sig-label { font-size: 11px; color: #555; }

  @page {
    margin-left: 20pt;
    margin-right: 20pt;
    margin-top: 0pt;
    margin-bottom: 38pt;
    padding-top: 20pt;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Company Header -->
  ${companyHeaderHtml}

  <!-- Title Band -->
  <div class="title-band">SALES RETURN</div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-col">
      <div class="info-row">
        <span class="info-label">Customer:</span>
        <span class="info-value">${customerName || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Address:</span>
        <span class="info-value">${customerAddress || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Reason:</span>
        <span class="info-value">
          <span class="reason-tag">${reason || '-'}</span>
        </span>
      </div>
    </div>
    <div class="info-col" style="text-align:right;">
      <div class="info-row" style="justify-content:flex-end;">
        <span class="info-label">Return No:</span>
        <span class="info-value" style="font-weight:bold;">&nbsp;${returnNo || '-'}</span>
      </div>
      <div class="info-row" style="justify-content:flex-end;">
        <span class="info-label">Return Date:</span>
        <span class="info-value">&nbsp;${returnDate || '-'}</span>
      </div>
      <div class="info-row" style="justify-content:flex-end;">
        <span class="info-label">Salesman:</span>
        <span class="info-value">&nbsp;${salesMan || '-'}</span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table border="1">
    <thead>
      <tr>
        <th style="width:6%; text-align:center;">#</th>
        <th style="width:18%;">Code</th>
        <th style="width:28%;">Description</th>
        <th style="width:10%; text-align:center;">Qty</th>
        <th style="width:10%; text-align:right;">Unit Price</th>
        <th style="width:10%; text-align:right;">Total<br/>[Excl. VAT]</th>
        <th style="width:9%; text-align:right;">VAT<br/>@5%</th>
        <th style="width:9%; text-align:right;">Total<br/>[Incl. VAT]</th>
      </tr>
    </thead>
    <tbody>
      ${itemRowsHtml}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals-wrap" style="page-break-inside:avoid;">
    <div class="totals-table">
      <div class="total-row">
        <span>Total Qty:</span>
        <span>${fmt(totalQty, 3)}</span>
      </div>
      <div class="total-row">
        <span>Taxable Amount (Excl. VAT):</span>
        <span>${fmt(subTotal)}</span>
      </div>
      <div class="total-row">
        <span>VAT Amount (5%):</span>
        <span>${fmt(vatAmount)}</span>
      </div>
      <div class="total-row grand">
        <span>GRAND TOTAL (Incl. VAT):</span>
        <span>${fmt(grandTotal)} AED</span>
      </div>
    </div>
  </div>

  <!-- Signature Section -->
  <div class="footer-sig">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Received By</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Authorized By</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">${companyName}</div>
    </div>
  </div>

</div>
</body>
</html>
`;

  // ── Generate PDF ──────────────────────────────────────────────────────────
  try {
    const options = {
      html,
      fileName: `SalesReturn_${returnNo || 'unknown'}`,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    console.log('SalesReturn PDF generated at:', file.filePath);

    if (setPdfUri) {
      setPdfUri(file.filePath);
    }

    // Share the PDF
    await Share.share({
      title: `Sales Return ${returnNo}`,
      url: `file://${file.filePath}`,
      type: 'application/pdf',
    });
  } catch (error) {
    console.log('generateSalesReturnPDF error:', error);
  } finally {
    if (resultClosePress) {
      resultClosePress();
    }
  }
};
