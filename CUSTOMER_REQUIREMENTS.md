# Customer Requirements - POC

## Overview
Extract data from various applications and aggregate them in a database to generate dashboards/reports focusing on two key metrics.

## Primary Use Cases

### 1. Marketing Effectiveness Ratio

**Data Sources Required:**
- **QuickBooks** (for marketing costs)
  - Available via API calls
  - Need specific data points for marketing costs
  - Can set up test account with test data
  - **ACTION NEEDED**: Customer to specify exact data points to pull

- **MaidCentral** (for customer acquisition data)
  - **QUESTION**: How to extract customer acquisition data?
  - **QUESTION**: Is this a downloadable report?
  - **ACTION NEEDED**: Customer to provide sample file/format

- **Google Docs** (for tracking lead sources and conversion rates)
  - **NOTE**: Google Doc (Word) files won't work programmatically
  - **SOLUTION**: Google Sheets can be accessed programmatically and ingested automatically
  - **ACTION NEEDED**: Customer to provide sample sheet structure

### 2. Employee Engagement vs. Business Performance

**Data Sources Required:**
- **Google Docs** (for employee engagement surveys)
  - Same limitation as above - need Google Sheets format
  - **ACTION NEEDED**: Customer to provide sample sheet structure

- **QuickBooks** (for financial performance)
  - **ACTION NEEDED**: Customer to be more specific about data points
  - **ACTION NEEDED**: Customer to share report with desired headings

- **MaidCentral** (for operational data)
  - **QUESTION**: Is this a downloadable report?
  - **ACTION NEEDED**: Customer to provide sample data format

## Key Action Items for Customer

1. **Define Marketing Effectiveness Ratio Formula**
   - What exact data elements comprise this ratio?
   - Provide specific formula if possible

2. **Specify QuickBooks Data Points**
   - Marketing costs: specific accounts/categories
   - Financial performance: specific reports/metrics

3. **MaidCentral Data Access**
   - Clarify how to extract customer acquisition data
   - Clarify how to extract operational data
   - Provide sample files if downloadable reports exist

4. **Google Sheets Structure**
   - Convert Google Docs to Google Sheets format
   - Provide sample sheets for:
     - Lead sources and conversion rates
     - Employee engagement surveys

5. **Define All Formulas**
   - Marketing Effectiveness Ratio calculation
   - Employee Engagement vs. Business Performance metrics
   - Any other derived metrics needed

## Technical Implementation Notes

- QuickBooks API integration is feasible
- Google Sheets API integration is straightforward
- MaidCentral integration depends on available export/API options
- All data will be aggregated in PostgreSQL database
- Dashboard will display calculated metrics and trends