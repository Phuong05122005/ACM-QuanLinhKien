# API Contract

## Overview
All REST API endpoints will adhere to a standardized JSON response format to ensure predictable client-side parsing and error handling.

## Success Response
When an API request succeeds, it must return an HTTP 2xx status code and the following JSON structure:

```json
{
  "success": true,
  "data": {
    // Response payload goes here
  }
}
```

## Error Response
When an API request fails, it must return an appropriate HTTP 4xx or 5xx status code and the following JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "field": "optional_field_name_for_validation_errors"
  }
}
```

* **code:** A string enum representing the error type (e.g., `UNAUTHORIZED`, `INSUFFICIENT_INVENTORY`, `VALIDATION_ERROR`).
* **message:** A user-friendly message explaining the error.
* **field:** (Optional) If the error is specific to a form field, this indicates which field failed validation.

## Constraints
* Never expose stack traces or internal database errors in the API response.
* Error responses must map to appropriate HTTP status codes (400, 401, 403, 404, 500).
