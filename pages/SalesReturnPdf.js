import {PermissionsAndroid, Platform} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share'; // Ensure this is installed via npm/yarn

const COMPANY_CONFIG = {
  ICUP: {
    name: 'ICECUP FOOD INDUSTRIES L.L.C',
    trn: '104173070400003',
    address: 'Warehouse 23, First Industrial Area, Jebel Ali, Dubai.',
    phone: 'Tel: +971 547642223 , +971 43264233',
  },
  ICELAB: {
    name: 'THE ICE LAB MANUFACTURING LLC',
    trn: '104112430400003',
    address: 'Central Plaza 2, Al Jurf, Ajman, UAE',
    phone: 'Tel: 065617700',
  },
  ICELAB_TEST: {
    name: 'THE ICE LAB MANUFACTURING LLC',
    trn: '104112430400003',
    address: 'Central Plaza 2, Al Jurf, Ajman, UAE',
    phone: 'Tel: 065617700',
  },
  MESHARI: {
    name: 'MESHARI FOODSTUFF TRADING LLC',
    trn: '100449215100003',
    address: '21 Street, Al Qusais Ind, Area.1 | PO Box: 20875',
    phone: 'Ph: 04 3700924',
  },
  PREMIER: {
    name: 'PREMIER AUTO PARTS LLC',
    trn: '10027835690000',
    address: 'Dubai, UAE',
    phone: '',
  },
};

export const generateSalesReturnPDF = async ({
  cmpcode,
  returnNo,
  returnDate,
  customerName,
  customerAddress,
  invNo,
  salesMan,
  reason,
  totalExcl,
  totalVat,
  grandTotal,
  itemList,
  resultClosePress,
}) => {
  console.log('Generating PDF for ItemList:', itemList);

  // ── Android storage permission ─────────────────────────────────────────
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

  const fmt = (n, decimals = 2) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);

  // ── Company config ─────────────────────────────────────────────────────
  const company = COMPANY_CONFIG[cmpcode?.trim().toUpperCase()] || {};
  const companyName = company.name || cmpcode;
  const trnNumber = company.trn || '-';
  const companyAddress = company.address || '';
  const companyPhone = company.phone || '';

  // ── Totals ─────────────────────────────────────────────────────────────
  const totalQty = itemList
    ? itemList.reduce((acc, item) => acc + (parseFloat(item.QTY) || 0), 0)
    : 0;

  const subTotal = totalExcl || 0;
  const vatAmt = totalVat || 0;
  const grandTotalAmt = grandTotal || 0;

  // ── Item rows ──────────────────────────────────────────────────────────
  const itemRowsHtml = itemList
    ? itemList
        .map(
          (item, index) => `
      <tr>
        <td style="width:6%; text-align:center;">${index + 1}</td>
        <td style="width:18%;">${item.CODE || '-'}</td>
        <td style="width:28%;">${item.DESC || '-'}</td>
        <td style="width:10%; text-align:center;">${fmt(item.QTY, 3)}</td>
        <td style="width:10%; text-align:right;">${fmt(item.PRICE || 0)}</td>
        <td style="width:10%; text-align:right;">${fmt(
          (parseFloat(item.QTY) || 0) * (parseFloat(item.PRICE) || 0),
        )}</td>
        <td style="width:9%; text-align:right;">${fmt(item.LINE_VAT || 0)}</td>
        <td style="width:9%; text-align:right;">${fmt(
          item.LINE_TOTAL_INCL || 0,
        )}</td>
      </tr>`,
        )
        .join('')
    : '';

  // ── HTML ───────────────────────────────────────────────────────────────
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin: 0; padding: 0;
    background: white;
    font-family: 'Calibri', sans-serif;
    font-size: 13px;
    color: #222;
  }
  .page { width: 100%; padding: 10px 20px; box-sizing: border-box; }
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
  table { border-collapse: collapse; width: 100%; margin-bottom: 0; }
  thead tr { background-color: #4B5290; color: white; }
  th { padding: 7px 6px; font-size: 12px; text-align: left; border: 1px solid #3a4170; }
  td { padding: 6px; font-size: 12px; border: 1px solid #ddd; color: #333; }
  tr:nth-child(even) td { background-color: #f7f8ff; }
  .totals-wrap {
    display: flex;
    justify-content: flex-end;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 5px 5px;
    padding: 8px 12px;
    margin-bottom: 10px;
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
  .footer-sig {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    padding: 0 12px;
  }
  .sig-box { display: flex; flex-direction: column; align-items: center; min-width: 130px; }
  .sig-line { width: 130px; border-bottom: 1px solid #555; margin-bottom: 4px; height: 28px; }
  .sig-label { font-size: 11px; color: #555; }
  @page { margin: 20pt; }
</style>
</head>
<body>
<div class="page">

  <div style="text-align:center; padding: 10px 0 6px 0;">
    <div style="font-size:22px; font-weight:bold;">${companyName}</div>
    <div style="font-size:13px; margin-top:4px;">${companyAddress}<br/>${companyPhone}</div>
    <div style="font-size:12px; font-weight:bold; margin-top:4px;">TRN: ${trnNumber}</div>
  </div>

  <div class="title-band">SALES RETURN</div>

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
        <span class="info-value"><span class="reason-tag">${
          reason || '-'
        }</span></span>
      </div>
    </div>
    <div class="info-col" style="text-align:right;">
      <div class="info-row" style="justify-content:flex-end;">
        <span class="info-label">Return No:</span>
        <span class="info-value" style="font-weight:bold;">&nbsp;${
          returnNo || '-'
        }</span>
      </div>
      <div class="info-row" style="justify-content:flex-end;">
        <span class="info-label">Invoice No:</span>
        <span class="info-value">&nbsp;${invNo || '-'}</span>
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

  <table>
    <thead>
      <tr>
        <th style="width:6%; text-align:center;">#</th>
        <th style="width:18%;">Code</th>
        <th style="width:28%;">Description</th>
        <th style="width:10%; text-align:center;">Qty</th>
        <th style="width:10%; text-align:right;">Unit Price</th>
        <th style="width:10%; text-align:right;">Total [Excl. VAT]</th>
        <th style="width:9%; text-align:right;">VAT @5%</th>
        <th style="width:9%; text-align:right;">Total [Incl. VAT]</th>
      </tr>
    </thead>
    <tbody>${itemRowsHtml}</tbody>
  </table>

  <div class="totals-wrap">
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
        <span>${fmt(vatAmt)}</span>
      </div>
      <div class="total-row grand">
        <span>GRAND TOTAL (Incl. VAT):</span>
        <span>${fmt(grandTotalAmt)} AED</span>
      </div>
    </div>
  </div>

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
</html>`;

  // ── Generate & Share PDF ───────────────────────────────────────────────
  try {
    const file = await RNHTMLtoPDF.convert({
      html,
      fileName: `SalesReturn_${returnNo || 'unknown'}`,
      directory: 'Documents',
    });

    console.log('PDF generated at:', file.filePath);

    // Using Share.open (react-native-share) for the preview functionality
    await Share.open({
      title: 'Share Sales Return PDF',
      url: `file://${file.filePath}`,
      type: 'application/pdf',
      failOnCancel: false, // Prevents throwing error if user cancels
    });
  } catch (error) {
    // Only log if it's a real error, not just a user cancellation
    if (
      error &&
      error.message &&
      !error.message.includes('User did not share')
    ) {
      console.log('generateSalesReturnPDF error:', error);
    }
  } finally {
    if (resultClosePress) resultClosePress();
  }
};
