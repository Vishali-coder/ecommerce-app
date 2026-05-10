/**
 * Generates and downloads a PDF invoice for an order
 * Uses browser print API — no external library needed
 */
export const generateInvoice = (order) => {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const subtotal = (order.totalAmount || 0) + (order.discountAmount || 0);
  const discount = order.discountAmount || 0;
  const total    = order.totalAmount || 0;

  const itemRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.brand || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">$${item.price?.toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const shippingAddr = order.shippingAddress
    ? `${order.shippingAddress.fullName}<br>
       ${order.shippingAddress.street}<br>
       ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
       ${order.shippingAddress.country}<br>
       ${order.shippingAddress.phone}`
    : 'Not provided';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice #${order.id?.slice(-10).toUpperCase()}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .brand { font-size: 28px; font-weight: 800; color: #4f46e5; }
        .brand-sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 22px; font-weight: 700; color: #111; }
        .invoice-title p { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .divider { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .info-box h4 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px; }
        .info-box p { font-size: 13px; color: #374151; line-height: 1.6; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .status-PLACED    { background: #dbeafe; color: #1d4ed8; }
        .status-SHIPPED   { background: #fef3c7; color: #92400e; }
        .status-DELIVERED { background: #d1fae5; color: #065f46; }
        .status-CANCELLED { background: #fee2e2; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #4f46e5; color: white; }
        thead th { padding: 12px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
        thead th:nth-child(2) { text-align: center; }
        tbody tr:hover { background: #f9fafb; }
        .totals { margin-left: auto; width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #374151; }
        .totals-row.discount { color: #059669; }
        .totals-divider { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
        .totals-row.total { font-size: 16px; font-weight: 700; color: #111; }
        .payment-info { margin-top: 32px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
        .payment-info h4 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px; }
        .payment-row { display: flex; gap: 24px; font-size: 13px; color: #374151; }
        .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        @media print {
          body { padding: 20px; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div>
          <div class="brand">🛒 ShopHub</div>
          <div class="brand-sub">Your trusted online store</div>
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p>#${order.id?.slice(-10).toUpperCase()}</p>
          <p style="margin-top:6px;">${formatDate(order.orderDate)}</p>
        </div>
      </div>

      <hr class="divider" />

      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-box">
          <h4>Bill To</h4>
          <p>${order.userEmail}</p>
        </div>
        <div class="info-box">
          <h4>Ship To</h4>
          <p>${shippingAddr}</p>
        </div>
        <div class="info-box">
          <h4>Order Info</h4>
          <p>
            Status: <span class="status-badge status-${order.status || 'PLACED'}">${order.status || 'PLACED'}</span><br>
            Payment: ${order.paymentMethod || 'COD'}<br>
            Paid: ${order.paymentStatus === 'PAID' ? '✓ Yes' : '⏳ Pending'}
            ${order.couponCode ? `<br>Coupon: ${order.couponCode}` : ''}
          </p>
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Brand</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
        <div class="totals-row discount">
          <span>Discount${order.couponCode ? ` (${order.couponCode})` : ''}</span>
          <span>-$${discount.toFixed(2)}</span>
        </div>` : ''}
        <div class="totals-row">
          <span>Shipping</span>
          <span style="color:#059669;">Free</span>
        </div>
        <hr class="totals-divider" />
        <div class="totals-row total">
          <span>Total</span>
          <span style="color:#4f46e5;">$${total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Payment Info -->
      <div class="payment-info">
        <h4>Payment Details</h4>
        <div class="payment-row">
          <span><strong>Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
          <span><strong>Status:</strong> ${order.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Payment Pending'}</span>
          <span><strong>Date:</strong> ${formatDate(order.orderDate)}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Thank you for shopping with ShopHub!</p>
        <p style="margin-top:4px;">This is a computer-generated invoice and does not require a signature.</p>
      </div>

      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
};
