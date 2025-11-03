// src/pages/orders/OrderView.jsx
import React, { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import logo from "../../../public/Company_logo.png"; // adjust path if necessary
import orderService from "../../service/orderService";
import { useParams, useNavigate } from "react-router-dom";

function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getById(id);
        const data = res?.data?.data || res?.data || res;
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const computeTotals = (items = []) => {
    let subTotal = 0;
    let totalTax = 0;
    items.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const up = Number(item.unit_price || 0);
      const tax = Number(item.tax_amount || 0);
      subTotal += qty * up;
      totalTax += tax;
    });
    return { subTotal, totalTax, grandTotal: subTotal + totalTax };
  };

  // Sanitize inline style strings (remove modern color functions)
  const removeProblematicInlineColorStyles = (el) => {
    const style = el.getAttribute && el.getAttribute("style");
    if (!style) return;
    if (/oklch|lab|lch|color\(/i.test(style)) {
      // remove only color/background/border-color declarations from inline style
      // naive approach: strip color/background declarations
      const cleaned = style
        .split(";")
        .filter((s) => !/^\s*(color|background|background-color|border-color)\s*:/i.test(s))
        .join(";");
      el.setAttribute("style", cleaned);
    }
  };

  // Disable all stylesheets, return an array of disabled CSSStyleSheet objects to restore later
  const disableAllStyleSheets = () => {
    const disabled = [];
    // document.styleSheets works even for <link> and <style>
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        if (!sheet.disabled) {
          sheet.disabled = true;
          disabled.push(sheet);
        }
      } catch (e) {
        // Some cross-origin sheets may throw when accessed; skip them but log
        console.warn("Could not disable stylesheet (cross-origin?)", sheet.href, e);
      }
    }
    return disabled;
  };

  const restoreStyleSheets = (disabledSheets = []) => {
    disabledSheets.forEach((sheet) => {
      try {
        sheet.disabled = false;
      } catch (e) {
        console.warn("Could not re-enable stylesheet", sheet.href, e);
      }
    });
  };

  // Main PDF handler: clone node, disable stylesheets, sanitize clone, call html2pdf, cleanup
  const handleDownload = async () => {
    if (!componentRef.current || !order) return alert("Nothing to download");

    // 1) disable page stylesheets (prevents html2canvas from parsing modern color functions)
    const disabledSheets = disableAllStyleSheets();

    // 2) clone the printable content so we don't mutate actual UI
    const clone = componentRef.current.cloneNode(true);
    clone.style.boxSizing = "border-box";

    // 3) sanitize inline style attributes in the clone (remove modern color functions)
    const allEls = clone.querySelectorAll("*");
    allEls.forEach((el) => {
      removeProblematicInlineColorStyles(el);
    });

    // optional: add a fallback tiny stylesheet inside clone to ensure readable content
    const safeStyleEl = document.createElement("style");
    safeStyleEl.innerHTML = `
      /* fallback safe colors for clone so PDF looks decent */
      .__pdf_safe_header { background-color: #1C2244 !important; color: #ffffff !important; }
      .__pdf_safe_table_header, thead { background-color: #1C2244 !important; color: #fff !important; }
      /* ensure borders/text are visible */
      * { color: #000 !important; background: transparent !important; border-color: #ccc !important; }
    `;
    clone.insertBefore(safeStyleEl, clone.firstChild);

    // 4) append clone off-screen (so it is in the DOM but not visible)
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.zIndex = "999999";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 5) generate PDF using html2pdf
    try {
      const opt = {
        margin: 10,
        filename: `Purchase_Order_${order.po_no || "PO"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().set(opt).from(clone).save();
      console.log("PDF generation succeeded");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed — check console. Attempting to restore page styles.");
    } finally {
      // cleanup: remove the off-screen clone and restore stylesheets
      try {
        if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      } catch (e) {
        /* ignore */
      }
      restoreStyleSheets(disabledSheets);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading order...</p>;
  if (!order) return <p style={{ padding: "20px", color: "red" }}>Order not found</p>;

  const { subTotal, totalTax, grandTotal } = computeTotals(order.items || []);

  return (
    <div style={{ backgroundColor: "#F7F8FC", minHeight: "100vh", padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "#ccc",
            color: "#000",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >← Back</button>

        <button
          onClick={handleDownload}
          style={{
            backgroundColor: "#1C2244",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >Download PDF</button>
      </div>

      <div
        ref={componentRef}
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        <div
          data-pdf-header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: "#1C2244",
            color: "#fff",
            padding: "20px 30px",
            borderRadius: "10px",
          }}
          className="__pdf_safe_header"
        >
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>PURCHASE ORDER</h1>
          <div style={{ textAlign: "center" }}>
            <img
              src={logo}
              alt="Company Logo"
              style={{ width: "140px", height: "auto", borderRadius: "5px", backgroundColor: "#fff", padding: "5px" }}
            />
            <p style={{ fontWeight: "600", marginTop: "5px" }}>ATELIER CREATION</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ width: "45%" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>From</h2>
            <p><strong>Company:</strong> Atelier Creation</p>
            <p><strong>Location:</strong> Coimbatore</p>
            <p><strong>Contact:</strong> {order.created_by_name || "N/A"}</p>
            <p><strong>Email:</strong> {order.created_by_email || "N/A"}</p>
          </div>

          <div style={{ width: "45%" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>To</h2>
            <p><strong>Vendor:</strong> {order.vendor?.name || "N/A"}</p>
            <p><strong>Contact Person:</strong> {order.vendor?.contact_person || "N/A"}</p>
            <p><strong>Address:</strong> {order.vendor?.address || "N/A"}</p>
            <p><strong>Phone:</strong> {order.vendor?.phone || "N/A"}</p>
            <p><strong>Email:</strong> {order.vendor?.email || "N/A"}</p>
            <p><strong>GST:</strong> {order.vendor?.gst_number || "N/A"}</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p><strong>PO Number:</strong> {order.po_no || "N/A"}</p>
            <p><strong>Order Date:</strong> {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <p><strong>Status:</strong> {order.status || "N/A"}</p>
          </div>
        </div>

        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1C2244", color: "#fff" }} className="__pdf_safe_table_header">
              <tr>
                <th style={thStyle}>Product Code</th>
                <th style={thStyle}>Product Name</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Unit Price</th>
                <th style={thStyle}>Tax</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{item.products?.product_code || "N/A"}</td>
                  <td style={tdStyle}>{item.products?.product_name || "N/A"}</td>
                  <td style={tdStyleRight}>{item.quantity || 0}</td>
                  <td style={tdStyleRight}>₹{item.unit_price || 0}</td>
                  <td style={tdStyleRight}>₹{item.tax_amount || 0}</td>
                  <td style={tdStyleRight}>
                    ₹{(((item.quantity || 0) * Number(item.unit_price || 0)) + Number(item.tax_amount || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ width: "50%", marginLeft: "auto", marginBottom: "20px" }}>
          <div style={rowStyle}><span>Sub Total:</span><span>₹{subTotal.toFixed(2)}</span></div>
          <div style={rowStyle}><span>Total Tax:</span><span>₹{totalTax.toFixed(2)}</span></div>
          <div style={{ ...rowStyle, fontWeight: "700" }}><span>Grand Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>Notes:</h3>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Payment due within 30 days.</li>
            <li>Goods once sold will not be taken back.</li>
            <li>Delivery expected within 7 days.</li>
          </ul>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
          <div><p>Manager Signature</p></div>
          <div><p>Client Signature</p></div>
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: "8px", textAlign: "left", border: "1px solid #ccc" };
const tdStyle = { padding: "8px", border: "1px solid #ccc", textAlign: "left", fontSize: "13px" };
const tdStyleRight = { ...tdStyle, textAlign: "right" };
const rowStyle = { display: "flex", justifyContent: "space-between", marginBottom: "6px", fontWeight: "600" };

export default OrderView;
