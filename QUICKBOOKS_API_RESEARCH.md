# QuickBooks Online API Integration Research

## Overview
Comprehensive research for integrating QuickBooks Online API to extract marketing costs and financial data for the Marketing Effectiveness Ratio calculation.

## Authentication & Setup

### OAuth 2.0 Authentication
- **Standard**: OAuth 2.0 protocol for secure authorization
- **Token Lifespan**: Access tokens valid for 1 hour, refresh tokens for 100 days
- **Developer Portal**: https://developer.intuit.com
- **Sandbox Environment**: Available for testing with test data

### Setup Steps
1. Create QuickBooks Developer account
2. Create new app in developer portal
3. Select QuickBooks Online Accounting scope
4. Obtain Client ID and Client Secret
5. Configure OAuth redirect URIs
6. Set up sandbox company for testing

## Key API Endpoints

### Base URLs
- **Sandbox**: `https://sandbox-quickbooks.api.intuit.com/v3/company/{companyId}`
- **Production**: `https://quickbooks.api.intuit.com/v3/company/{companyId}`

### Accounts Endpoint
- **URL**: `/query` with query parameter
- **Query**: `SELECT * FROM Account`
- **Filter Expenses**: `SELECT * FROM Account WHERE AccountType = 'Expense'`
- **Response**: JSON with `QueryResponse.Account[]` array

### Account JSON Structure
```json
{
  "QueryResponse": {
    "Account": [
      {
        "Id": "7",
        "Name": "Marketing Expenses", 
        "AccountType": "Expense",
        "AcctNum": "6000",
        "SubAccount": false,
        "Active": true
      }
    ]
  }
}
```

### Expense/Purchase Endpoints
- **Bills**: `/bill` - For vendor expenses
- **Purchase**: `/purchase` - For direct expenses
- **Items**: `/item` - For expense items

### Expense JSON Structure
```json
{
  "VendorRef": { "value": "56" },
  "Line": [{
    "Amount": 100.00,
    "DetailType": "AccountBasedExpenseLineDetail", 
    "AccountBasedExpenseLineDetail": {
      "AccountRef": { "value": "7" }
    }
  }],
  "CurrencyRef": { "value": "USD" }
}
```

## Marketing Cost Extraction Strategy

### 1. Account Discovery
- Query all expense accounts
- Filter for marketing-related accounts:
  - "Marketing Expenses"
  - "Advertising"
  - "Promotional Costs"
  - "Digital Marketing"
  - Custom marketing account names

### 2. Expense Data Retrieval
- **Bills**: `SELECT * FROM Bill WHERE Line.AccountBasedExpenseLineDetail.AccountRef = 'MARKETING_ACCOUNT_ID'`
- **Purchases**: `SELECT * FROM Purchase WHERE Line.AccountBasedExpenseLineDetail.AccountRef = 'MARKETING_ACCOUNT_ID'`
- **Date Filtering**: Add `WHERE TxnDate >= 'YYYY-MM-DD' AND TxnDate <= 'YYYY-MM-DD'`

### 3. Data Aggregation
- Sum amounts by marketing account
- Group by time periods (monthly, quarterly)
- Include vendor information for detailed analysis

## Technical Implementation Plan

### Phase 1: Authentication Setup
```javascript
// OAuth 2.0 flow implementation
const authUrl = `https://appcenter.intuit.com/connect/oauth2?
  client_id=${CLIENT_ID}&
  scope=com.intuit.quickbooks.accounting&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  access_type=offline`;
```

### Phase 2: Account Discovery
```javascript
// Get all expense accounts
const accountsQuery = "SELECT * FROM Account WHERE AccountType = 'Expense'";
const response = await fetch(`${API_BASE}/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/text'
  },
  body: accountsQuery
});
```

### Phase 3: Marketing Cost Extraction
```javascript
// Get marketing expenses for date range
const expenseQuery = `
  SELECT * FROM Bill 
  WHERE Line.AccountBasedExpenseLineDetail.AccountRef IN ('${marketingAccountIds.join("','")}')
  AND TxnDate >= '${startDate}' 
  AND TxnDate <= '${endDate}'
`;
```

## Database Schema Extensions

### QuickBooks Integration Tables
```sql
-- Store QuickBooks connection info per tenant
CREATE TABLE quickbooks_connections (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  company_id VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Store marketing accounts mapping
CREATE TABLE marketing_accounts (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  qb_account_id VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(100),
  is_marketing_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store extracted marketing costs
CREATE TABLE marketing_costs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  qb_transaction_id VARCHAR(50) NOT NULL,
  account_id BIGINT REFERENCES marketing_accounts(id),
  amount DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL,
  vendor_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Rate Limits & Best Practices

### Rate Limits
- **Sandbox**: 100 requests per minute per app
- **Production**: 500 requests per minute per app
- **Burst**: Higher limits for short bursts

### Best Practices
1. **Token Management**: Implement automatic refresh token renewal
2. **Error Handling**: Handle 401 (unauthorized) and 429 (rate limit) responses
3. **Data Sync**: Implement incremental sync using lastUpdatedTime
4. **Webhook Support**: Use webhooks for real-time data updates
5. **Secure Storage**: Encrypt and securely store access/refresh tokens

## Integration Timeline

### Week 1: Foundation
- [ ] Set up QuickBooks Developer account
- [ ] Create sandbox environment
- [ ] Implement OAuth 2.0 authentication flow
- [ ] Create database schema extensions

### Week 2: Core Integration  
- [ ] Build account discovery functionality
- [ ] Implement marketing account identification
- [ ] Create expense data extraction service
- [ ] Add token management and refresh logic

### Week 3: Data Processing
- [ ] Build data aggregation and calculation engine
- [ ] Implement Marketing Effectiveness Ratio formulas
- [ ] Create dashboard widgets for QB data
- [ ] Add data sync scheduling

### Week 4: Testing & Polish
- [ ] End-to-end testing with sandbox data
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Documentation and customer handoff

## Next Steps

1. **Customer Questions to Resolve:**
   - Which specific accounts in their QB contain marketing costs?
   - What date ranges should we analyze?
   - How do they define "Marketing Effectiveness Ratio"?
   - Do they want real-time sync or scheduled batch imports?

2. **Technical Setup:**
   - Create QB Developer account
   - Set up sandbox environment with test marketing data
   - Begin OAuth 2.0 implementation

3. **Architecture Decisions:**
   - Token storage strategy (encrypted database vs. secure vault)
   - Sync frequency (real-time webhooks vs. scheduled jobs)
   - Data retention policies for QB transaction data