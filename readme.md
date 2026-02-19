# Cours HTML Classroom Monitor
Use puppeteer and jest to validate assignments.

## Environment variables

- `HTML_VALIDATOR_URL` (optional): HTML validator endpoint. Defaults to `https://validator.w3.org/nu/?out=json&level=error`.
- `CSS_VALIDATOR_URL` (optional): CSS validator endpoint. Defaults to `https://validator.w3.org/nu/?out=json&level=error` and is called with `Content-Type: text/css`.