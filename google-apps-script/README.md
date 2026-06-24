# Expert Mode feedback sheet setup

1. Create a Google Sheet with a tab named `feedback`.
2. Add this header row:

   `timestamp | session_id | feedback_type | reason | comment | user_email | input_payload | output_payload | recommended_passes | solver_version | user_agent | page_url`

3. Open **Extensions → Apps Script**, paste `feedback.gs`, and deploy it as a web app.
4. Set **Execute as** to the sheet owner and **Who has access** to anyone.
5. Copy the deployed `/exec` URL into `FEEDBACK_ENDPOINT` at the top of `assets/script.js`.

The endpoint is intentionally public and contains no secret. The script validates the known feedback fields, limits stored text, and neutralizes spreadsheet-formula prefixes in user-controlled values.

For local QA only, dev mode can override the destination without editing the production constant:

`?devmode&feedbackEndpoint=http://127.0.0.1:8001/feedback`
