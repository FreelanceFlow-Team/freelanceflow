#!/bin/bash
# Test: Create an invoice and verify email is sent

# Configuration
API_URL="http://localhost:3010/api"
JWT_TOKEN="your-jwt-token-here"

# Step 1: Create a test user (register)
echo "=== Step 1: Register user ==="
curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freelancer@test.com",
    "password": "TestPassword123!",
    "firstName": "Jean",
    "lastName": "Dupont"
  }' | jq .

# Step 2: Login and get JWT token
echo -e "\n=== Step 2: Login ==="
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freelancer@test.com",
    "password": "TestPassword123!"
  }')

JWT_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.accessToken')
USER_ID=$(echo $AUTH_RESPONSE | jq -r '.user.id')
echo "JWT Token: $JWT_TOKEN"
echo "User ID: $USER_ID"

# Step 3: Create a test client
echo -e "\n=== Step 3: Create client ==="
CLIENT_RESPONSE=$(curl -s -X POST "$API_URL/clients" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "email": "client@acme.com",
    "phone": "+33 1 23 45 67 89",
    "address": "123 rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "vatNumber": "FR12345678901"
  }')

CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.id')
echo "Client ID: $CLIENT_ID"
echo $CLIENT_RESPONSE | jq .

# Step 4: Create an invoice and trigger email sending
echo -e "\n=== Step 4: Create invoice (PDF email will be sent) ==="
INVOICE_RESPONSE=$(curl -s -X POST "$API_URL/invoices" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "'$CLIENT_ID'",
    "issueDate": "2026-04-14T10:00:00Z",
    "dueDate": "2026-05-14T10:00:00Z",
    "taxRate": 20,
    "notes": "Service rendu - Merci!",
    "lines": [
      {
        "description": "Design UX/UI - 10 hours",
        "quantity": 10,
        "unitPrice": 75.00
      },
      {
        "description": "Development - 5 hours",
        "quantity": 5,
        "unitPrice": 100.00
      }
    ]
  }')

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.id')
INVOICE_NUMBER=$(echo $INVOICE_RESPONSE | jq -r '.number')
echo "Invoice ID: $INVOICE_ID"
echo "Invoice Number: $INVOICE_NUMBER"
echo $INVOICE_RESPONSE | jq .

# Check backend logs for email sending confirmation
echo -e "\n=== Check backend logs for email sending ==="
echo "Look for messages like:"
echo "  ✅ Invoice PDF sent to client@acme.com (message ID: ...)"
echo "  ✅ EMAIL: Using test email configuration (development mode)"

# Step 5: Verify invoice was created
echo -e "\n=== Step 5: Retrieve invoice ==="
curl -s -X GET "$API_URL/invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

# Step 6: Download invoice PDF (manual test)
echo -e "\n=== Step 6: Download invoice PDF ==="
echo "Run: curl -O -J -H \"Authorization: Bearer $JWT_TOKEN\" \"$API_URL/invoices/$INVOICE_ID/pdf\""
echo "This will save: facture-$INVOICE_NUMBER.pdf"

# Notes
echo -e "\n=== NOTES ==="
echo "Email Configuration (Development):"
echo "  - SMTP_HOST is empty = test mode (logs only, doesn't send real emails)"
echo "  - Check application logs for: 'Invoice PDF sent to client@acme.com'"
echo ""
echo "Email Configuration (Production):"
echo "  - Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env"
echo "  - Real emails will be sent to: client@acme.com"
echo "  - Include: facture-FF-YYYY-NNN.pdf as attachment"
