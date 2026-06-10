import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const now = new Date();
const isoNow = now.toISOString();
const feedDate = isoNow.slice(0, 10);

const topics = [
  {
    id: "fx-mt4-mt5",
    product: "FX",
    queries: ["forex broker MT5", "EURUSD trading", "low spread forex broker"],
    offer: "MT5 demo account onboarding"
  },
  {
    id: "gold-silver-oil",
    product: "Metals / Energy CFD",
    queries: ["gold trading XAUUSD", "silver trading XAGUSD", "crude oil trading WTI"],
    offer: "Gold, silver and oil CFD sample feed"
  },
  {
    id: "crypto-futures",
    product: "Crypto Futures",
    queries: ["crypto futures trading", "bitcoin liquidation", "perp trading exchange"],
    offer: "Crypto futures demo and exchange affiliate offer"
  },
  {
    id: "stocks-options",
    product: "Stocks / Options",
    queries: ["stock trading app", "Nasdaq options trading", "NVDA TSLA trading"],
    offer: "Stock broker comparison and signup flow"
  },
  {
    id: "affiliate-ib",
    product: "Affiliate / IB",
    queries: ["forex trading educator", "crypto trading community", "trading signals group"],
    offer: "IB and affiliate partnership proposal"
  }
];

function scoreFromReddit(post) {
  const score = Number(post.score || 0);
  const comments = Number(post.num_comments || 0);
  return Math.min(100, Math.round(45 + Math.log10(score + 1) * 16 + Math.log10(comments + 1) * 14));
}

function freshnessTier(createdAt) {
  const ageHours = (now.getTime() - new Date(createdAt).getTime()) / 36e5;
  if (ageHours <= 24) return "hot_24h";
  if (ageHours <= 72) return "warm_72h";
  if (ageHours <= 168) return "cooling_7d";
  return "stale";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

async function fetchJson(url, options = {}) {
  const maxTime = Math.max(2, Math.ceil((options.timeoutMs || 8000) / 1000));
  const { stdout } = await execFileAsync("curl", [
    "-L",
    "--silent",
    "--show-error",
    "--fail",
    "--max-time",
    String(maxTime),
    "-H",
    "accept: application/json",
    "-A",
    "DailyActiveTraderLeadsBot/0.1 public-signal-monitor",
    url
  ], {
    maxBuffer: 8 * 1024 * 1024,
    timeout: (options.timeoutMs || 8000) + 2000
  });
  return JSON.parse(stdout);
}

async function loadCryptoMarkets() {
  const ids = "bitcoin,ethereum,solana,ripple,binancecoin";
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h`;
  try {
    const coins = await fetchJson(url);
    return coins.map((coin) => ({
      lead_id: `MKT-${feedDate}-${coin.id}`,
      feed_date: feedDate,
      last_seen_at: isoNow,
      freshness_tier: "hot_24h",
      lead_type: "Market Signal",
      target_product: "Crypto Futures",
      market: "Global",
      language: "Multi",
      source_type: "CoinGecko public API",
      source_url: `https://www.coingecko.com/en/coins/${coin.id}`,
      activity_signal: `${coin.name} 24h change ${Number(coin.price_change_percentage_24h || 0).toFixed(2)}%`,
      intent_signal: "Crypto volatility campaign trigger",
      activity_score: Math.min(100, Math.round(60 + Math.abs(Number(coin.price_change_percentage_24h || 0)) * 4)),
      compliance_status: "market_signal_no_personal_data",
      recommended_offer: "Crypto futures trader feed",
      next_action: "Package crypto futures audience and creator topics"
    }));
  } catch (error) {
    return [{
      lead_id: `ERR-${feedDate}-coingecko`,
      feed_date: feedDate,
      last_seen_at: isoNow,
      freshness_tier: "hot_24h",
      lead_type: "Connector Status",
      target_product: "Crypto Futures",
      market: "Global",
      language: "Multi",
      source_type: "CoinGecko public API",
      source_url: "https://docs.coingecko.com/",
      activity_signal: `CoinGecko unavailable: ${error.message}`,
      intent_signal: "Connector needs retry",
      activity_score: 0,
      compliance_status: "system_status",
      recommended_offer: "Retry on next scheduled run",
      next_action: "No client delivery from failed connector"
    }];
  }
}

async function searchReddit(topic, query) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=day&limit=8`;
  const json = await fetchJson(url, { timeoutMs: 6000 });
  return (json.data?.children || []).map((item) => {
    const post = item.data;
    const createdAt = new Date(Number(post.created_utc || 0) * 1000).toISOString();
    return {
      lead_id: `SOC-${feedDate}-${post.id}`,
      feed_date: feedDate,
      last_seen_at: createdAt,
      freshness_tier: freshnessTier(createdAt),
      lead_type: "Social Intent Signal",
      target_product: topic.product,
      market: "Global",
      language: "Unknown",
      source_type: "Reddit public search",
      source_url: `https://www.reddit.com${post.permalink}`,
      public_author: post.author ? `u/${post.author}` : "",
      activity_signal: post.title || query,
      intent_signal: `Matched query: ${query}`,
      activity_score: scoreFromReddit(post),
      compliance_status: "public_social_signal_no_contact_data",
      recommended_offer: topic.offer,
      next_action: "Review for topic heat, creator/community fit or broker campaign angle"
    };
  });
}

async function loadRedditSignals() {
  const tasks = [];
  for (const topic of topics) {
    for (const query of topic.queries.slice(0, 2)) {
      tasks.push(
        searchReddit(topic, query).catch((error) => [{
          lead_id: `ERR-${feedDate}-reddit-${topic.id}-${query.replace(/\W+/g, "-").toLowerCase()}`,
          feed_date: feedDate,
          last_seen_at: isoNow,
          freshness_tier: "hot_24h",
          lead_type: "Connector Status",
          target_product: topic.product,
          market: "Global",
          language: "Unknown",
          source_type: "Reddit public search",
          source_url: "https://www.reddit.com/dev/api/",
          public_author: "",
          activity_signal: `Reddit search unavailable for "${query}": ${error.message}`,
          intent_signal: "Connector needs retry or API credentials",
          activity_score: 0,
          compliance_status: "system_status",
          recommended_offer: "Retry on next scheduled run",
          next_action: "No client delivery from failed connector"
        }])
      );
    }
  }
  const batches = await Promise.all(tasks);
  const rows = batches.flat();
  /*
  for (const topic of topics) {
    for (const query of topic.queries.slice(0, 2)) {
      try {
        rows.push(...await searchReddit(topic, query));
      } catch (error) {
        rows.push({
          lead_id: `ERR-${feedDate}-reddit-${topic.id}-${query.replace(/\W+/g, "-").toLowerCase()}`,
          feed_date: feedDate,
          last_seen_at: isoNow,
          freshness_tier: "hot_24h",
          lead_type: "Connector Status",
          target_product: topic.product,
          market: "Global",
          language: "Unknown",
          source_type: "Reddit public search",
          source_url: "https://www.reddit.com/dev/api/",
          public_author: "",
          activity_signal: `Reddit search unavailable for "${query}": ${error.message}`,
          intent_signal: "Connector needs retry or API credentials",
          activity_score: 0,
          compliance_status: "system_status",
          recommended_offer: "Retry on next scheduled run",
          next_action: "No client delivery from failed connector"
        });
      }
    }
  }
  */
  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.lead_id)) return false;
    seen.add(row.lead_id);
    return true;
  }).sort((a, b) => Number(b.activity_score) - Number(a.activity_score)).slice(0, 100);
}

function connectorStatus() {
  return [
    {
      source: "CoinGecko",
      status: "active_public",
      cadence: "hourly",
      note: "Crypto market signals, no personal contact data."
    },
    {
      source: "Reddit public search",
      status: "active_public_best_effort",
      cadence: "hourly",
      note: "Public topic signals only; respect API limits and community rules."
    },
    {
      source: "X API",
      status: process.env.X_BEARER_TOKEN ? "ready_with_secret" : "waiting_for_secret",
      cadence: "near_real_time_when_enabled",
      note: "Needs X_BEARER_TOKEN in GitHub Secrets for filtered stream/search."
    },
    {
      source: "YouTube Data API",
      status: process.env.YOUTUBE_API_KEY ? "ready_with_secret" : "waiting_for_secret",
      cadence: "hourly_when_enabled",
      note: "Needs YOUTUBE_API_KEY in GitHub Secrets."
    },
    {
      source: "Apollo / Wiza / Lusha / ContactOut",
      status: "waiting_for_vendor_api_keys",
      cadence: "daily_when_enabled",
      note: "Contact enrichment must run server-side. Do not expose keys in static pages."
    }
  ];
}

async function main() {
  const [marketRows, redditRows] = await Promise.all([
    loadCryptoMarkets(),
    loadRedditSignals()
  ]);
  const rows = [...marketRows, ...redditRows].sort((a, b) => Number(b.activity_score) - Number(a.activity_score));

  const feed = {
    generated_at: isoNow,
    feed_date: feedDate,
    cadence: "hourly_github_actions",
    legal_boundary: "Public market and social signals only. No private group scraping and no contact-data enrichment without vendor keys and lawful basis.",
    row_count: rows.length,
    connectors: connectorStatus(),
    rows
  };

  await mkdir("data", { recursive: true });
  await writeFile("data/latest-active-feed.json", JSON.stringify(feed, null, 2));

  const headers = [
    "lead_id",
    "feed_date",
    "last_seen_at",
    "freshness_tier",
    "lead_type",
    "target_product",
    "market",
    "language",
    "source_type",
    "source_url",
    "public_author",
    "activity_signal",
    "intent_signal",
    "activity_score",
    "compliance_status",
    "recommended_offer",
    "next_action"
  ];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
  await writeFile("data/latest-active-feed.csv", `${csv}\n`);

  console.log(`Generated ${rows.length} active feed rows at ${isoNow}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
