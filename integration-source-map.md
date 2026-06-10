# Daily Active Trader Lead Feed - Integration Source Map

## Already Connected In The Public Site

### TradingView Widgets

Use: live FX, stock, gold and crypto market overview, FX ticker tape and US stock hotlists.

Why it matters: brokers can see the platform is driven by current market context. This supports daily campaign packaging such as FX volatility, gold moves, crypto futures interest and stock trading demand.

Status: connected directly in `index.html`.

Official docs: https://www.tradingview.com/widget/

### CoinGecko Public API

Use: crypto price and 24h movement feed.

Why it matters: useful for crypto exchange, spot trading and futures campaign triggers.

Status: connected directly in `index.html` with a browser-side public API call.

Production note: for reliable commercial traffic, use a CoinGecko API key through a backend proxy.

Official docs: https://docs.coingecko.com/

## Must-Have Contact Data APIs

These need your own account, API key, subscription or sales approval. Do not expose these keys inside a public GitHub Pages site. They should run through a backend.

### Apollo

Use: B2B prospect search and enrichment for broker decision-makers, affiliate managers, IBs, KOLs and trading educators.

Priority: very high.

Integration type: API key.

Useful endpoints: People Search and People Enrichment.

Official docs: https://docs.apollo.io/

### Wiza

Use: LinkedIn URL, name/company or professional profile enrichment for verified emails, phone numbers and professional datapoints.

Priority: very high.

Integration type: API token, usually API-specific pricing or sales-assisted access.

Official docs: https://wiza.co/wiza-api

### Lusha

Use: real-time B2B contact, company and signal enrichment.

Priority: high.

Integration type: API key and credit limits.

Official docs: https://docs.lusha.com/

### ContactOut

Use: LinkedIn profile to email, phone, work experience, education and skills.

Priority: high for creator, KOL, affiliate and IB research.

Integration type: API key, often sales-assisted.

Official docs: https://api.contactout.com/

### Cognism

Use: compliant B2B contact data, especially Europe and phone-verified sales data.

Priority: high for regulated regions.

Integration type: enterprise/sales-assisted.

Note: useful if you sell into EU/UK brokers and need stronger compliance posture.

### FullEnrich / Clay

Use: waterfall enrichment across multiple vendors.

Priority: high if you want to avoid building every vendor connector yourself.

Integration type: API/workflow platform.

Best role: orchestration layer for Apollo, Wiza, Lusha, ContactOut and email verification.

## Market Signal APIs To Add Next

### Alpha Vantage

Use: stocks, ETFs, FX, commodities, crypto and technical indicators.

Priority: high for API-level FX and stock data after the public widget MVP.

Integration type: API key.

Official docs: https://www.alphavantage.co/documentation/

### Twelve Data

Use: real-time and historical stocks, forex, ETFs, indices and crypto market data.

Priority: high if you need one API covering both FX and stocks.

Integration type: API key.

Official site/docs: https://twelvedata.com/

### Polygon.io

Use: US stocks, options, indices, forex and crypto market data.

Priority: high for serious stock/option broker campaigns.

Integration type: paid API key for most commercial usage.

Official site/docs: https://polygon.io/

### CoinMarketCap

Use: crypto market rankings, latest pricing, exchange activity, market pairs and liquidity.

Priority: high for crypto exchange and futures broker campaigns.

Official docs: https://coinmarketcap.com/api/documentation/

### Nasdaq Data Link / Nasdaq Market Data

Use: market data, indexes, equities, options and alternative financial datasets.

Priority: later-stage.

Important: this is not personal trader contact data. Use it for market signals, content, tools and campaign triggers.

Official docs/catalog: https://www.nasdaq.com/solutions/data/market-data-catalog

## Social / Intent Sources

These are valuable but need careful terms-of-service and compliance review.

### TradingView Community

Use: identify active authors, scripts, symbols and topics.

Role: KOL and activity signal source.

### YouTube / TikTok / X

Use: find finance creators, trading educators, market commentators and affiliate candidates.

Role: active affiliate and IB feed.

### Telegram / Discord

Use: trading community owner and admin discovery.

Role: IB, affiliate and community lead source.

Compliance note: do not scrape private groups or personal data without permission.

## Recommended Backend Architecture

Public GitHub Pages can show the offer and public market signals, but contact-data vendors need a backend.

Recommended stack:

- frontend: current GitHub Pages site
- backend: Vercel Functions, Cloudflare Workers, Supabase Edge Functions or a small Node API
- storage: Airtable, Supabase, Google Sheets or PostgreSQL
- scheduled jobs: daily refresh at 00:00 UTC and regional refreshes before sales teams start calling
- CRM delivery: HubSpot, Salesforce, Pipedrive, Airtable, CSV export

## First Integration Order

1. Apollo API for B2B broker/affiliate/IB sourcing.
2. Wiza API for LinkedIn/profile enrichment.
3. Hunter or NeverBounce for email verification.
4. ContactOut or Lusha as waterfall fallback.
5. CoinGecko/CoinMarketCap for crypto market triggers.
6. TradingView widgets/community research for asset and creator signals.
7. HubSpot or Airtable delivery.

## Fields Every Vendor Connector Should Normalize

- source_vendor
- source_url
- lead_type
- product_interest
- country
- language
- name
- company
- title_or_segment
- linkedin_url
- email
- email_status
- phone
- phone_status
- activity_signal
- last_seen_at
- freshness_tier
- activity_score
- compliance_status
- recommended_offer
- next_action

## Important Boundary

Do not advertise that the platform sells "Nasdaq trader phone numbers" or "LinkedIn scraped personal data." Sell daily active lead intelligence, compliant prospecting data, source-labeled enrichment and broker-ready CRM delivery.
