Snow Genius — Expert Mode UI: Resort Typeahead Update
====================================================

What changed?
-------------
Only the **entry method for resorts** in the UI:
- Replaces a plain <select> or text input with a **type-ahead** that:
  - Filters after 3 characters (letters/numbers)
  - Displays **Resort Name, ST**
  - Submits **resort_id** to the backend (payload shape unchanged)

No backend changes, no schema changes, no API contract changes.

Files in this package
---------------------
static/script.js   — Drop in to replace or include after your existing script.  
static/style.css   — Append to your stylesheet or replace if you keep styles separate.  
static/resorts.json — Copied from your Pass_Picker/data/resorts.json for client-side search.

How to install
--------------
1) Back up your current UI's `static/script.js` and `static/style.css`.
2) Copy the **static/** folder from this package into your UI project, merging with your existing `static/`.
3) Ensure your page has:
   - A container with id="riders" and id="resorts"
   - Buttons with id="addRiderBtn" and id="addResortBtn"
   - A form with id="expertForm"
   - An input with id="endpoint" set to your backend URL
4) Open the page, type 3+ characters into the resort input, pick a result, and submit.

Expected payload (unchanged)
----------------------------
{
  "riders": [{"age":39,"category":"None"}],
  "resort_days": [{"resort":"loon","days":7,"blackout_ok":false}]
}

Notes
-----
- Duplicate names/IDs are displayed with state to guide selection. The posted `resort_id` matches your backend data.
