const SHEET_NAME = "feedback";
const ALLOWED_FEEDBACK_TYPES = new Set(["positive", "negative"]);
const ALLOWED_REASONS = new Set([
  "",
  "expected_different_pass",
  "price_seems_wrong",
  "resort_access_seems_wrong",
  "blackout_or_weekend_issue",
  "other",
]);

function doPost(e) {
  try {
    const rawBody = e && e.postData ? e.postData.contents || "{}" : "{}";
    if (rawBody.length > 250000) {
      throw new Error("Feedback payload is too large");
    }

    const body = JSON.parse(rawBody);
    if (!ALLOWED_FEEDBACK_TYPES.has(body.feedback_type)) {
      throw new Error("Invalid feedback_type");
    }
    if (!ALLOWED_REASONS.has(body.reason || "")) {
      throw new Error("Invalid reason");
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("Missing sheet tab: " + SHEET_NAME);
    }

    const row = [
      validTimestamp(body.timestamp),
      sanitize(body.session_id, 100),
      sanitize(body.feedback_type, 20),
      sanitize(body.reason, 80),
      sanitize(body.comment, 2000),
      sanitize(body.user_email, 254),
      safeJson(body.input_payload || {}, 45000),
      safeJson(body.output_payload || {}, 45000),
      safeJson(body.recommended_passes || [], 45000),
      sanitize(body.solver_version, 100),
      sanitize(body.user_agent, 1000),
      sanitize(body.page_url, 2000),
    ];
    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Snow Genius feedback endpoint is live",
  });
}

function validTimestamp(value) {
  const timestamp = new Date(value);
  return isNaN(timestamp.getTime()) ? new Date() : timestamp;
}

function sanitize(value, maxLength) {
  if (value === null || value === undefined) return "";
  let text = String(value).slice(0, maxLength || 5000);
  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }
  return text;
}

function safeJson(value, maxLength) {
  return sanitize(JSON.stringify(value), maxLength);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
