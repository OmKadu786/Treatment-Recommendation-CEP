import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --navy: #0A1628;
    --navy-mid: #112240;
    --navy-light: #1a3a6e;
    --cobalt: #1E4FD8;
    --cobalt-light: #3B6FFF;
    --sky: #5B9BD5;
    --ice: #C9DCEF;
    --white: #F8FAFF;
    --off-white: #EBF1FA;
    --text-primary: #0A1628;
    --text-muted: #4A6080;
    --mild: #22C55E;
    --moderate: #F59E0B;
    --severe: #EF4444;
    --card-shadow: 0 2px 16px rgba(30,79,216,0.10);
    --card-shadow-hover: 0 8px 32px rgba(30,79,216,0.18);
    --radius: 14px;
    --radius-sm: 8px;
    --font-display: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--off-white);
    color: var(--text-primary);
    min-height: 100vh;
  }

  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--off-white);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    padding: 28px 0 20px;
    position: fixed;
    left: 0; top: 0;
    z-index: 100;
    box-shadow: 4px 0 24px rgba(10,22,40,0.18);
    transition: width 0.2s;
  }

  .sidebar-logo {
    padding: 0 24px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--cobalt), var(--sky));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(30,79,216,0.4);
  }

  .logo-text { color: white; }
  .logo-name { font-family: var(--font-display); font-size: 20px; line-height: 1; }
  .logo-sub { font-size: 10px; color: var(--ice); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    color: rgba(255,255,255,0.6);
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    border: none; background: none; width: 100%; text-align: left;
  }

  .nav-item:hover { background: rgba(255,255,255,0.07); color: white; }
  .nav-item.active { background: rgba(30,79,216,0.45); color: white; }
  .nav-item .nav-icon { font-size: 17px; width: 20px; text-align: center; }

  .sidebar-footer {
    padding: 16px 24px 0;
    border-top: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.4);
    font-size: 11px;
  }

  /* ── MAIN ── */
  .main-content {
    margin-left: 240px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .top-bar {
    background: white;
    border-bottom: 1px solid var(--ice);
    padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }

  .top-bar-title { font-family: var(--font-display); font-size: 22px; color: var(--navy); }
  .top-bar-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 1px; }

  .user-chip {
    display: flex; align-items: center; gap: 10px;
    background: var(--off-white);
    border-radius: 40px;
    padding: 6px 14px 6px 8px;
    font-size: 13px; font-weight: 500;
    color: var(--navy);
    cursor: pointer;
  }

  .user-avatar {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--cobalt), var(--sky));
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 12px; font-weight: 600;
  }

  .page { padding: 32px; flex: 1; }

  /* ── CARDS ── */
  .card {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    padding: 24px;
    transition: box-shadow 0.2s;
  }

  .card:hover { box-shadow: var(--card-shadow-hover); }

  .card-title {
    font-family: var(--font-display);
    font-size: 18px;
    color: var(--navy);
    margin-bottom: 4px;
  }

  .card-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }

  /* ── DASHBOARD ── */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }

  .stat-card {
    background: white;
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--card-shadow);
    display: flex; align-items: flex-start; gap: 14px;
  }

  .stat-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .stat-icon.blue { background: rgba(30,79,216,0.1); }
  .stat-icon.green { background: rgba(34,197,94,0.1); }
  .stat-icon.amber { background: rgba(245,158,11,0.1); }
  .stat-icon.red { background: rgba(239,68,68,0.1); }

  .stat-value { font-family: var(--font-display); font-size: 28px; color: var(--navy); line-height: 1; }
  .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

  .dashboard-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }

  /* ── IPSS QUIZ ── */
  .ipss-progress-bar {
    height: 6px;
    background: var(--ice);
    border-radius: 99px;
    margin-bottom: 28px;
    overflow: hidden;
  }

  .ipss-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--cobalt), var(--sky));
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  .ipss-question-card {
    background: white;
    border-radius: var(--radius);
    padding: 32px;
    box-shadow: var(--card-shadow);
    margin-bottom: 20px;
  }

  .ipss-q-number {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--cobalt);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .ipss-q-text {
    font-size: 18px;
    font-weight: 500;
    color: var(--navy);
    line-height: 1.5;
    margin-bottom: 24px;
  }

  .ipss-options { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }

  .ipss-option {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 14px 8px;
    border: 2px solid var(--ice);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s;
    background: white;
  }

  .ipss-option:hover { border-color: var(--cobalt-light); background: rgba(30,79,216,0.03); }
  .ipss-option.selected { border-color: var(--cobalt); background: rgba(30,79,216,0.06); }

  .option-score {
    font-family: var(--font-display);
    font-size: 22px;
    color: var(--navy);
  }

  .option-selected .option-score { color: var(--cobalt); }

  .option-label {
    font-size: 10px;
    color: var(--text-muted);
    text-align: center;
    line-height: 1.3;
  }

  .ipss-option.selected .option-label { color: var(--cobalt); }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 24px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }

  .btn-primary {
    background: var(--cobalt);
    color: white;
  }

  .btn-primary:hover { background: var(--cobalt-light); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(30,79,216,0.3); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-outline {
    background: white;
    border: 2px solid var(--ice);
    color: var(--text-primary);
  }

  .btn-outline:hover { border-color: var(--cobalt); color: var(--cobalt); }

  /* ── RESULT ── */
  .result-hero {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
    border-radius: var(--radius);
    padding: 36px;
    color: white;
    text-align: center;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }

  .result-hero::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(91,155,213,0.12);
  }

  .result-score-ring {
    width: 120px; height: 120px;
    border-radius: 50%;
    margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .result-score-ring.mild { background: rgba(34,197,94,0.2); border: 3px solid var(--mild); }
  .result-score-ring.moderate { background: rgba(245,158,11,0.2); border: 3px solid var(--moderate); }
  .result-score-ring.severe { background: rgba(239,68,68,0.2); border: 3px solid var(--severe); }

  .result-score-num { font-family: var(--font-display); font-size: 42px; line-height: 1; }
  .result-score-label { font-size: 11px; letter-spacing: 1px; opacity: 0.8; }

  .severity-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 18px;
    border-radius: 99px;
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 14px;
  }

  .severity-badge.mild { background: rgba(34,197,94,0.2); color: var(--mild); }
  .severity-badge.moderate { background: rgba(245,158,11,0.2); color: var(--moderate); }
  .severity-badge.severe { background: rgba(239,68,68,0.2); color: var(--severe); }

  .result-hero h2 { font-family: var(--font-display); font-size: 24px; margin-bottom: 10px; }
  .result-hero p { font-size: 14px; opacity: 0.8; max-width: 480px; margin: 0 auto; }

  .alert-severe {
    background: linear-gradient(135deg, #FFF1F0, #FFE4E1);
    border: 2px solid var(--severe);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex; gap: 16px; align-items: flex-start;
  }

  .alert-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
  .alert-title { font-weight: 600; color: #B91C1C; margin-bottom: 4px; }
  .alert-body { font-size: 13px; color: #7F1D1D; line-height: 1.6; }

  .disclaimer {
    background: rgba(30,79,216,0.05);
    border-left: 3px solid var(--cobalt);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 20px;
    line-height: 1.6;
  }

  /* ── TREATMENT CARDS ── */
  .treatment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

  .treatment-card {
    background: white;
    border-radius: var(--radius);
    padding: 22px;
    box-shadow: var(--card-shadow);
    border-top: 3px solid var(--cobalt);
    transition: all 0.2s;
  }

  .treatment-card:hover { box-shadow: var(--card-shadow-hover); transform: translateY(-2px); }

  .tx-name { font-family: var(--font-display); font-size: 17px; color: var(--navy); margin-bottom: 6px; }
  .tx-abbr {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 11px;
    background: rgba(30,79,216,0.08);
    color: var(--cobalt);
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  .tx-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 14px; }
  .tx-meta { display: flex; flex-wrap: wrap; gap: 6px; }

  .tx-tag {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 99px;
    background: var(--off-white);
    color: var(--text-muted);
    font-weight: 500;
  }

  /* ── CHATBOT ── */
  .chat-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

  .chat-window {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    display: flex;
    flex-direction: column;
    height: 580px;
  }

  .chat-header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--ice);
    display: flex; align-items: center; gap: 12px;
  }

  .chat-bot-avatar {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--cobalt), var(--sky));
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px;
  }

  .chat-bot-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mild); margin-top: 2px; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mild); }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: var(--ice); border-radius: 99px; }

  .msg-row { display: flex; gap: 10px; align-items: flex-end; }
  .msg-row.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600;
  }

  .msg-avatar.bot { background: linear-gradient(135deg, var(--cobalt), var(--sky)); color: white; }
  .msg-avatar.user { background: var(--ice); color: var(--navy); }

  .msg-bubble {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 13.5px;
    line-height: 1.6;
  }

  .msg-bubble.bot {
    background: var(--off-white);
    border-bottom-left-radius: 4px;
    color: var(--text-primary);
  }

  .msg-bubble.user {
    background: var(--cobalt);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .msg-disclaimer {
    font-size: 10px;
    opacity: 0.6;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(0,0,0,0.08);
  }

  .chat-input-bar {
    padding: 14px 16px;
    border-top: 1px solid var(--ice);
    display: flex; gap: 10px;
  }

  .chat-input {
    flex: 1;
    border: 1.5px solid var(--ice);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.15s;
    resize: none;
  }

  .chat-input:focus { border-color: var(--cobalt); }

  .send-btn {
    width: 40px; height: 40px;
    border-radius: var(--radius-sm);
    background: var(--cobalt);
    color: white;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .send-btn:hover { background: var(--cobalt-light); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── FAQ ── */
  .faq-sidebar {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    padding: 20px;
  }

  .faq-title-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }

  .faq-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 3px 8px;
    background: rgba(30,79,216,0.08);
    color: var(--cobalt);
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .faq-item {
    border-bottom: 1px solid var(--off-white);
    padding: 12px 0;
  }

  .faq-item:last-child { border-bottom: none; }

  .faq-q {
    font-size: 13px;
    font-weight: 500;
    color: var(--navy);
    cursor: pointer;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  }

  .faq-q:hover { color: var(--cobalt); }

  .faq-a {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-top: 8px;
  }

  .faq-freq {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--cobalt);
    background: rgba(30,79,216,0.06);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    margin-top: 2px;
  }

  /* ── ANALYTICS ── */
  .analytics-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-top: 24px; }

  .mini-bar-chart { display: flex; flex-direction: column; gap: 10px; }

  .bar-row { display: flex; align-items: center; gap: 12px; }
  .bar-label { font-size: 12px; color: var(--text-muted); width: 120px; flex-shrink: 0; }
  .bar-track { flex: 1; height: 10px; background: var(--off-white); border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
  .bar-val { font-size: 12px; font-family: var(--font-mono); color: var(--navy); width: 30px; text-align: right; }

  .history-table { width: 100%; border-collapse: collapse; }
  .history-table th {
    text-align: left;
    padding: 10px 14px;
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    background: var(--off-white);
    border-bottom: 1px solid var(--ice);
  }

  .history-table td {
    padding: 12px 14px;
    font-size: 13px;
    border-bottom: 1px solid var(--off-white);
    color: var(--text-primary);
  }

  .severity-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
  }

  .severity-pill.mild { background: rgba(34,197,94,0.1); color: var(--mild); }
  .severity-pill.moderate { background: rgba(245,158,11,0.1); color: var(--moderate); }
  .severity-pill.severe { background: rgba(239,68,68,0.1); color: var(--severe); }

  /* ── SCHEMA PAGE ── */
  .schema-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .schema-table-card {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    overflow: hidden;
  }

  .schema-table-header {
    background: var(--navy);
    padding: 14px 18px;
    display: flex; align-items: center; gap: 8px;
  }

  .schema-table-name {
    font-family: var(--font-mono);
    font-size: 14px;
    color: white;
    font-weight: 500;
  }

  .schema-table-icon { font-size: 16px; }

  .schema-cols { padding: 12px; }

  .schema-col {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 8px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-primary);
  }

  .schema-col:hover { background: var(--off-white); }

  .col-key { color: var(--moderate); }
  .col-fk { color: var(--cobalt); }
  .col-type { margin-left: auto; color: var(--text-muted); font-size: 11px; }

  .sql-block {
    background: var(--navy);
    border-radius: var(--radius);
    padding: 24px;
    overflow-x: auto;
    margin-top: 24px;
  }

  .sql-block pre {
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.8;
    color: var(--ice);
    white-space: pre;
  }

  .sql-keyword { color: #7B93FD; }
  .sql-type { color: #FFB86C; }
  .sql-comment { color: rgba(201,220,239,0.5); font-style: italic; }

  /* ── LOADING DOTS ── */
  .loading-dots { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
  .loading-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--sky);
    animation: bounce 1.2s infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }

  .section-header { margin-bottom: 24px; }
  .section-header h1 { font-family: var(--font-display); font-size: 28px; color: var(--navy); }
  .section-header p { font-size: 14px; color: var(--text-muted); margin-top: 4px; }

  .score-tracker {
    background: var(--navy);
    color: white;
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .score-tracker-label { font-size: 12px; opacity: 0.7; }
  .score-tracker-val { font-family: var(--font-display); font-size: 32px; }

  .chart-container { position: relative; height: 200px; }

  .qol-section {
    background: linear-gradient(135deg, var(--cobalt) 0%, var(--navy-light) 100%);
    border-radius: var(--radius);
    padding: 24px;
    color: white;
    margin-bottom: 20px;
  }

  .qol-section h3 { font-family: var(--font-display); font-size: 18px; margin-bottom: 8px; }
  .qol-section p { font-size: 13px; opacity: 0.85; margin-bottom: 18px; }

  .qol-options { display: flex; gap: 8px; flex-wrap: wrap; }

  .qol-opt {
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.1);
    color: white;
    transition: all 0.15s;
  }

  .qol-opt:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.6); }
  .qol-opt.selected { background: white; color: var(--cobalt); border-color: white; }

  .actions-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

  /* ── INLINE SVG CHART ── */
  .svg-chart { width: 100%; overflow: visible; }

  .nav-section-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.3);
    padding: 16px 18px 6px;
    font-weight: 600;
  }

  /* ── MODALS ── */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(10, 22, 40, 0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .modal-content {
    background: white; border-radius: var(--radius); padding: 32px;
    width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    text-align: center;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .modal-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(239, 68, 68, 0.1); color: var(--severe);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin: 0 auto 20px;
  }
  .modal-title { font-family: var(--font-display); font-size: 22px; color: var(--navy); margin-bottom: 8px; }
  .modal-desc { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; justify-content: center; }
`;

// ─────────────────────────────────────────────
// DATA & CONSTANTS
// ─────────────────────────────────────────────
const IPSS_QUESTIONS = [
  {
    id: 1,
    text: "Over the past month, how often have you had a sensation of not emptying your bladder completely after you finished urinating?",
    options: ["Not at all", "Less than 1 in 5 times", "Less than half the time", "About half the time", "More than half the time", "Almost always"]
  },
  {
    id: 2,
    text: "Over the past month, how often have you had to urinate again less than two hours after you finished urinating?",
    options: ["Not at all", "Less than 1 in 5 times", "Less than half the time", "About half the time", "More than half the time", "Almost always"]
  },
  {
    id: 3,
    text: "Over the past month, how often have you found you stopped and started again several times when you urinated?",
    options: ["Not at all", "Less than 1 in 5 times", "Less than half the time", "About half the time", "More than half the time", "Almost always"]
  },
  {
    id: 4,
    text: "Over the past month, how often have you found it difficult to postpone urination?",
    options: ["Not at all", "Less than 1 in 5 times", "Less than half the time", "About half the time", "More than half the time", "Almost always"]
  },
  {
    id: 5,
    text: "Over the past month, how often have you had a weak urinary stream?",
    options: ["Not at all", "Less than 1 in 5 times", "Less than half the time", "About half the time", "More than half the time", "Almost always"]
  },
  {
    id: 6,
    text: "Over the past month, how often have you had to push or strain to begin urination?",
    options: ["Not at all", "Less than 1 in 5 times", "Less than half the time", "About half the time", "More than half the time", "Almost always"]
  },
  {
    id: 7,
    text: "Over the past month, many times did you most typically get up to urinate from the time you went to bed until the time you got up in the morning?",
    options: ["None", "1 time", "2 times", "3 times", "4 times", "5 times or more"]
  }
];

const QOL_OPTIONS = [
  "Delighted", "Pleased", "Mostly satisfied", "Mixed", "Mostly dissatisfied", "Unhappy", "Terrible"
];

const getSeverity = (score) => {
  if (score <= 7) return "mild";
  if (score <= 19) return "moderate";
  return "severe";
};

const TREATMENTS = {
  mild: [
    {
      name: "Watchful Waiting",
      abbr: "Active Surveillance",
      desc: "Lifestyle modifications and regular monitoring. Appropriate for mild symptoms with low bother score. Includes fluid management, bladder training, and periodic IPSS re-evaluation.",
      tags: ["Non-invasive", "First-line", "Low risk", "Annual follow-up"]
    },
    {
      name: "Alpha-Blockers",
      abbr: "Medical Therapy",
      desc: "Tamsulosin, Silodosin, or Alfuzosin relax smooth muscle in prostate and bladder neck, improving urine flow rapidly within 48–72 hours.",
      tags: ["Oral medication", "Rapid onset", "Well tolerated", "Reversible"]
    }
  ],
  moderate: [
    {
      name: "UroLift®",
      abbr: "PUL — Prostatic Urethral Lift",
      desc: "Small implants hold the obstructing prostate lobes apart, opening the urethra. Preserves sexual function. Ideal for moderate symptoms with prostate volume 30–80 mL.",
      tags: ["Outpatient", "Sexual function preserved", "Rapid recovery", "AUA Guidelines: Level 1"]
    },
    {
      name: "Rezūm™ Water Vapor Therapy",
      abbr: "WAVE — Water Ablation",
      desc: "Convective radiofrequency water vapor energy destroys excess prostate tissue. Durable 5-year outcomes. Suitable for prostate 30–80 mL with or without a median lobe.",
      tags: ["Office-based", "Median lobe capable", "Durable", "AUA Guideline Endorsed"]
    },
    {
      name: "5-Alpha Reductase Inhibitors",
      abbr: "5-ARI Combination Therapy",
      desc: "Finasteride or Dutasteride reduce prostate volume over 6–12 months. Often combined with alpha-blockers (CombAT Trial) for moderate-severe symptoms.",
      tags: ["Oral medication", "Volume reduction", "Prevents progression", "Combination therapy"]
    },
    {
      name: "iTind™",
      abbr: "Temporary Implantable Nitinol Device",
      desc: "A nitinol device temporarily placed to reshape the prostatic urethra over 5–7 days, then removed. Preserves ejaculatory function with durable improvement.",
      tags: ["Temporary device", "Office procedure", "Sexual function preserved", "Novel MIST"]
    }
  ],
  severe: [
    {
      name: "Transurethral Resection (TURP)",
      abbr: "TURP — Gold Standard",
      desc: "Gold-standard surgical procedure. Monopolar or bipolar TURP removes obstructing prostate tissue endoscopically. Strong long-term evidence for symptom relief and Qmax improvement.",
      tags: ["Gold standard", "High efficacy", "Hospitalization", "Long-term data"]
    },
    {
      name: "Holmium Laser Enucleation",
      abbr: "HoLEP — Laser Procedure",
      desc: "Size-independent laser enucleation of the prostate. Recommended for large glands (>80 mL). Lower bleeding risk than TURP, shorter catheterization time.",
      tags: ["Any prostate size", "Low bleeding risk", "Durable outcomes", "AUA Preferred: Large gland"]
    },
    {
      name: "Aquablation®",
      abbr: "AQUABEAM — Robotic Waterjet",
      desc: "Ultrasound-guided, robotically-controlled waterjet resection. Image-based planning preserves ejaculatory nerves. Effective for complex anatomy 30–150 mL.",
      tags: ["Robotic precision", "Sexual function", "30–150 mL", "FDA Cleared"]
    },
    {
      name: "Simple Prostatectomy",
      abbr: "Open / Robot-Assisted",
      desc: "For very large prostates (>100 mL). Open Millin's or robot-assisted (RASP) approach. Highly effective but reserved for when endoscopic approaches are unsuitable.",
      tags: ["Large glands >100 mL", "Robot-assisted", "High efficacy", "Inpatient"]
    }
  ]
};

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
// Mock history removed in favor of real Supabase data

const INITIAL_FAQS = [
  { q: "What is BPH?", a: "Benign Prostatic Hyperplasia (BPH) is a non-cancerous enlargement of the prostate gland that can obstruct urine flow, commonly affecting men over 50.", freq: 47, expanded: false },
  { q: "What is the IPSS score?", a: "The International Prostate Symptom Score (IPSS) is a validated 7-question tool that quantifies lower urinary tract symptom severity: Mild (0–7), Moderate (8–19), Severe (20–35).", freq: 41, expanded: false },
  { q: "How does UroLift differ from TURP?", a: "UroLift uses permanent mechanical implants to hold the prostate lobes apart without cutting tissue, preserving sexual function. TURP removes tissue and is more invasive but with stronger long-term data.", freq: 38, expanded: false },
  { q: "Is Rezum covered by insurance?", a: "Rezum Water Vapor Therapy is FDA-cleared and covered by Medicare. Private insurance coverage varies; patients should verify with their provider prior to the procedure.", freq: 29, expanded: false },
  { q: "Can MIST procedures fail?", a: "Yes. Re-treatment rates exist for all procedures. PUL (UroLift) has a ~13% 5-year retreatment rate. Aquablation and HoLEP show durable outcomes. Consult your urologist for personalized risk assessment.", freq: 22, expanded: false },
];

const INITIAL_CHAT = [
  {
    role: "bot",
    text: "Hello! I'm MIST-AI, your BPH care assistant. I can help you understand your IPSS score, explain treatment options, and answer questions about minimally invasive procedures.\n\n⚕️ Please note I provide educational information only — always consult your urologist for medical decisions.",
    disclaimer: true
  }
];

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function SparklineChart({ data }) {
  if (!data || data.length < 2) return null;
  const W = 400, H = 100, pad = 20;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (W - 2 * pad),
    y: H - pad - ((v - min) / range) * (H - 2 * pad)
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-chart" style={{ height: 100 }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E4FD8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1E4FD8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="#1E4FD8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#1E4FD8" strokeWidth="2" />
      ))}
    </svg>
  );
}

// ── DASHBOARD ──
function Dashboard({ onStartAssessment, history, onDeleteAssessment }) {
  const [viewAll, setViewAll] = useState(false);
  const displayHistory = viewAll ? history : history.slice(0, 5);

  const latest = history[0];
  const scores = history.map(h => h.score).reverse();
  return (
    <div className="page">
      <div className="section-header">
        <h1>Clinical Overview</h1>
        <p>Your BPH management dashboard — IPSS trends and care summary</p>
      </div>

      <div className="stats-row">
        {[
          { icon: "📋", label: "Total Assessments", val: history.length, cls: "blue" },
          { icon: "📈", label: "Latest IPSS Score", val: latest?.score ?? "—", cls: latest?.severity === "severe" ? "red" : latest?.severity === "moderate" ? "amber" : "green" },
          { icon: "💊", label: "Active Treatments", val: 2, cls: "blue" },
          { icon: "🗓", label: "Next Follow-up", val: "7 days", cls: "green" }
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title">IPSS Score Trend</div>
          <div className="card-sub">Your symptom progression over the past 6 assessments</div>
          <SparklineChart data={scores} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Jun 2025</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Mar 2026</span>
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid var(--off-white)", paddingTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Latest severity:</span>
            <span className={`severity-pill ${latest?.severity}`}>● {latest?.severity?.toUpperCase()}</span>
            <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onStartAssessment}>
              Take New Assessment →
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Recent Assessments</div>
          <div className="card-sub">Last 5 IPSS evaluations</div>
          <table className="history-table" style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Severity</th>
                <th style={{ textAlign: "right", paddingRight: "16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((h, i) => (
                <tr key={h.id || i}>
                  <td>{h.date}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{h.score}</td>
                  <td><span className={`severity-pill ${h.severity}`}>● {h.severity}</span></td>
                  <td style={{ textAlign: "right", paddingRight: "16px" }}>
                    <button 
                      onClick={() => onDeleteAssessment(h.id)} 
                      style={{ background: "none", border: "none", color: "var(--severe)", cursor: "pointer", opacity: 0.6, fontSize: "16px", padding: 0 }}
                      onMouseOver={e => e.target.style.opacity = 1}
                      onMouseOut={e => e.target.style.opacity = 0.6}
                      title="Delete Assessment"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length > 5 && (
             <button 
               onClick={() => setViewAll(!viewAll)} 
               style={{ width: "100%", padding: "12px", background: "var(--off-white)", border: "none", color: "var(--cobalt)", cursor: "pointer", fontSize: "13px", fontWeight: 600, borderBottomLeftRadius: "var(--radius)", borderBottomRightRadius: "var(--radius)", transition: "all 0.15s" }}
               onMouseOver={e => e.target.style.background = "rgba(30,79,216,0.1)"}
               onMouseOut={e => e.target.style.background = "var(--off-white)"}
             >
                 {viewAll ? "Show Less" : "View All Assessments ⌄"}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── IPSS ASSESSMENT ──
function IPSSAssessment({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [qolAnswer, setQolAnswer] = useState(null);
  const [phase, setPhase] = useState("questions"); // questions | qol | result

  const answered = answers[current] !== undefined;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);

  const handleSelect = (score) => {
    setAnswers(prev => ({ ...prev, [current]: score }));
  };

  const handleNext = () => {
    if (current < IPSS_QUESTIONS.length - 1) setCurrent(c => c + 1);
    else setPhase("qol");
  };

  const handleBack = () => {
    if (phase === "qol") setPhase("questions");
    else if (current > 0) setCurrent(c => c - 1);
  };

  const handleSubmit = () => {
    const severity = getSeverity(totalScore);
    const result = {
      score: totalScore,
      severity,
      qol: qolAnswer,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      answers
    };
    onComplete(result);
    setPhase("result");
  };

  const [result, setResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const handleCompleteInternal = async () => {
    setSubmitting(true);
    const payload = {
      q1_incomplete_emptying: answers[0],
      q2_frequency: answers[1],
      q3_intermittency: answers[2],
      q4_urgency: answers[3],
      q5_weak_stream: answers[4],
      q6_straining: answers[5],
      q7_nocturia: answers[6]
    };
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-ipss', {
        body: { answers: payload }
      });
      if (error) throw error;
      if (data && data.error) throw new Error(`${data.error} | ${data.details}`);
      
      const properResult = {
        score: data.totalScore,
        severity: data.severity.toLowerCase(),
        qol: qolAnswer,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        answers: answers
      };
      setResult(properResult);
      onComplete(properResult);
      setPhase("result");
    } catch(err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "result" && result) return <IPSSResult result={result} onRetake={() => { setCurrent(0); setAnswers({}); setQolAnswer(null); setPhase("questions"); setResult(null); }} />;

  const progress = phase === "qol" ? 100 : ((current) / IPSS_QUESTIONS.length) * 100;

  return (
    <div className="page">
      <div className="section-header">
        <h1>IPSS Assessment</h1>
        <p>International Prostate Symptom Score — Validated AUA/EAU questionnaire</p>
      </div>

      <div className="ipss-progress-bar">
        <div className="ipss-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="score-tracker">
        <div>
          <div className="score-tracker-label">Running Score</div>
          <div className="score-tracker-val">{totalScore} <span style={{ fontSize: 16, opacity: 0.5 }}>/ 35</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="score-tracker-label">{phase === "qol" ? "Quality of Life" : `Question ${current + 1} of ${IPSS_QUESTIONS.length}`}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, opacity: 0.7, marginTop: 4 }}>
            {totalScore <= 7 ? "🟢 Mild range" : totalScore <= 19 ? "🟡 Moderate range" : "🔴 Severe range"}
          </div>
        </div>
      </div>

      {phase === "questions" && (
        <div className="ipss-question-card">
          <div className="ipss-q-number">QUESTION {String(current + 1).padStart(2, "0")} / {IPSS_QUESTIONS.length}</div>
          <div className="ipss-q-text">{IPSS_QUESTIONS[current].text}</div>
          <div className="ipss-options">
            {IPSS_QUESTIONS[current].options.map((label, idx) => (
              <button
                key={idx}
                className={`ipss-option ${answers[current] === idx ? "selected" : ""}`}
                onClick={() => handleSelect(idx)}
              >
                <div className="option-score">{idx}</div>
                <div className="option-label">{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "qol" && (
        <div className="qol-section">
          <h3>Quality of Life Assessment</h3>
          <p>If you were to spend the rest of your life with your urinary condition the way it is now, how would you feel about that?</p>
          <div className="qol-options">
            {QOL_OPTIONS.map((opt, i) => (
              <button key={i} className={`qol-opt ${qolAnswer === opt ? "selected" : ""}`} onClick={() => setQolAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="actions-row">
        <button className="btn btn-outline" onClick={handleBack} disabled={current === 0 && phase === "questions"}>← Back</button>
        {phase === "questions" ? (
          <button className="btn btn-primary" onClick={handleNext} disabled={!answered}>
            {current < IPSS_QUESTIONS.length - 1 ? "Next Question →" : "Continue to QoL →"}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleCompleteInternal} disabled={!qolAnswer || submitting}>
            {submitting ? "Calculating..." : "View Results →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── IPSS RESULT ──
function IPSSResult({ result, onRetake }) {
  const treatments = TREATMENTS[result.severity];
  const severityColor = { mild: "var(--mild)", moderate: "var(--moderate)", severe: "var(--severe)" }[result.severity];

  return (
    <div className="page">
      <div className="section-header">
        <h1>Assessment Results</h1>
        <p>Your IPSS evaluation and evidence-based treatment pathway</p>
      </div>

      {result.severity === "severe" && (
        <div className="alert-severe">
          <div className="alert-icon">🚨</div>
          <div>
            <div className="alert-title">Immediate Clinical Consultation Recommended</div>
            <div className="alert-body">
              Your IPSS score of <strong>{result.score}</strong> falls in the Severe range (20–35), indicating significant lower urinary tract symptoms that require prompt evaluation by a urologist. Untreated severe BPH can lead to acute urinary retention, bladder damage, or renal impairment. Please contact your healthcare provider within 48 hours.
            </div>
          </div>
        </div>
      )}

      <div className="result-hero">
        <div className={`result-score-ring ${result.severity}`}>
          <div className="result-score-num">{result.score}</div>
          <div className="result-score-label">out of 35</div>
        </div>
        <div className={`severity-badge ${result.severity}`} style={{ color: "white", background: "rgba(255,255,255,0.15)", border: `1px solid ${severityColor}` }}>
          ● {result.severity.toUpperCase()} BPH SYMPTOMS
        </div>
        <h2>
          {result.severity === "mild" ? "Low Impact Symptoms Detected" :
            result.severity === "moderate" ? "Moderate LUTS — Treatment Recommended" :
              "Severe LUTS — Urgent Urologist Referral"}
        </h2>
        <p>
          {result.severity === "mild" ? "Your symptoms are in the mild range. Watchful waiting with lifestyle modifications is typically the first-line approach." :
            result.severity === "moderate" ? "Your score suggests moderate obstruction. Minimally invasive options like UroLift or Rezum may significantly improve your quality of life." :
              "Severe symptoms require urgent evaluation. Surgical intervention such as TURP, HoLEP, or Aquablation may be indicated."}
        </p>
        {result.qol && (
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
            Quality of Life: <strong>{result.qol}</strong>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Recommended Treatment Pathways</div>
        <div className="card-sub">
          Evidence-based options per AUA/EAU guidelines for {result.severity.toUpperCase()} symptoms (Score: {result.score})
        </div>
        <div className="treatment-grid">
          {treatments.map((t, i) => (
            <div className="treatment-card" key={i}>
              <div className="tx-name">{t.name}</div>
              <div className="tx-abbr">{t.abbr}</div>
              <div className="tx-desc">{t.desc}</div>
              <div className="tx-meta">
                {t.tags.map((tag, j) => <span className="tx-tag" key={j}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div className="disclaimer">
          ⚕️ <strong>Medical Disclaimer:</strong> The treatment recommendations above are generated for educational purposes only and are based on published AUA/EAU clinical guidelines. They do not constitute personalized medical advice. Individual treatment decisions must be made in consultation with a qualified urologist who can assess your complete medical history, comorbidities, prostate volume, and imaging findings. Do not make any clinical decisions based solely on this tool.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-outline" onClick={onRetake}>↺ Retake Assessment</button>
      </div>
    </div>
  );
}

// ── AI CHATBOT ──
function ChatBot({ onFAQUpdate }) {
  const [messages, setMessages] = useState(INITIAL_CHAT);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [keywordLog, setKeywordLog] = useState({});
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const KEYWORDS = ["bph", "prostate", "urologist", "ipss", "urolift", "rezum", "turp", "holep", "aquablation", "surgery", "medication", "symptom", "treatment", "mist", "catheter", "retention", "flow", "nocturia", "frequency"];

  const extractKeywords = (text) => {
    const lower = text.toLowerCase();
    return KEYWORDS.filter(k => lower.includes(k));
  };

  const updateFAQFromKeywords = useCallback((newLog) => {
    const sorted = Object.entries(newLog).sort((a, b) => b[1] - a[1]);
    const topKeyword = sorted[0]?.[0];
    if (!topKeyword || newLog[topKeyword] < 3) return;

    const autoFAQs = {
      urolift: { q: "What is the recovery time after UroLift?", a: "UroLift is an outpatient procedure. Most patients return to normal activity within 1–2 days. Temporary urinary symptoms (frequency, urgency, mild discomfort) resolve within 2–4 weeks." },
      rezum: { q: "How does Rezum compare to UroLift?", a: "Both are minimally invasive. Rezum uses steam to reduce tissue and works for median lobe enlargement. UroLift uses implants and has faster recovery. Discuss with your urologist which fits your anatomy and goals." },
      holep: { q: "Is HoLEP better than TURP?", a: "HoLEP has comparable efficacy to TURP with lower bleeding risk, shorter catheterization time, and is size-independent. It requires specialized laser expertise. Both are excellent options depending on surgeon experience." },
      turp: { q: "What are TURP side effects?", a: "Common: retrograde ejaculation (~65–90%), temporary urinary symptoms. Rare: bleeding, infection, TUR syndrome (with monopolar), urethral stricture. Bipolar TURP has lower TUR syndrome risk." },
      aquablation: { q: "Who is a good candidate for Aquablation?", a: "Aquablation is ideal for men with complex anatomy, prostates 30–150 mL, and those wishing to preserve ejaculatory function. It uses robotic ultrasound-guided waterjet with image-planned treatment." },
      nocturia: { q: "What causes nocturia in BPH?", a: "BPH causes bladder outlet obstruction, reducing functional capacity and stimulating overactive detrusor. Nocturnal polyuria may also contribute. IPSS question 7 specifically quantifies nocturia severity." },
    };

    if (autoFAQs[topKeyword]) {
      const newEntry = { ...autoFAQs[topKeyword], freq: newLog[topKeyword], expanded: false };
      setFaqs(prev => {
        const exists = prev.find(f => f.q === newEntry.q);
        if (exists) return prev.map(f => f.q === newEntry.q ? { ...f, freq: newLog[topKeyword] } : f);
        return [newEntry, ...prev].slice(0, 8);
      });
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");

    const kw = extractKeywords(userText);
    const newLog = { ...keywordLog };
    kw.forEach(k => { newLog[k] = (newLog[k] || 0) + 1; });
    setKeywordLog(newLog);
    updateFAQFromKeywords(newLog);

    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    const systemPrompt = `You are MIST-AI, a specialized BPH (Benign Prostatic Hyperplasia) patient support assistant for the MIST: IPSS-Based Recommendation System. You provide educational information about:
- BPH symptoms and the IPSS scoring system
- Minimally Invasive Surgical Therapies (MIST): UroLift, Rezum, iTind, Aquablation, HoLEP, TURP
- AUA/EAU clinical guidelines for BPH management
- Post-procedure care and expectations

IMPORTANT RULES:
1. Always end responses with: "⚕️ Disclaimer: This is educational information only. Consult your urologist for personalized medical advice."
2. Never diagnose, prescribe, or make specific treatment recommendations for individual patients.
3. Keep responses concise (3-5 sentences) and clinically accurate.
4. If asked about emergency symptoms (unable to urinate, severe pain, blood), urge immediate emergency care.
5. Be warm, professional, and reassuring.`;

    try {
      // --- RAG PIPELINE: Step 1. Get embedding for the user's query
      const embedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=AIzaSyDNjzAvZLuYXHtk888dt3B9PVYQg1Dn54Y`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "models/text-embedding-004", content: { parts: [{ text: userText }] } })
      });
      const embedData = await embedResponse.json();
      const queryEmbedding = embedData.embedding?.values;
      
      // --- RAG PIPELINE: Step 2. Search Vector Database
      let ragContext = "No immediate clinical context was fetched.";
      if (queryEmbedding) {
        const { data: chunks, error } = await supabase.rpc('match_knowledge_base', {
          query_embedding: queryEmbedding,
          match_threshold: 0.65,
          match_count: 4
        });
        
        if (!error && chunks && chunks.length > 0) {
          ragContext = chunks.map(c => `[Source URL: ${c.url || "Internal Knowledge Base"}]\n${c.content}`).join("\n\n---\n\n");
        }
      }

      // --- RAG PIPELINE: Step 3. Augment System Prompt
      const dynamicSystemPrompt = `${systemPrompt}\n\n====================\n🔍 RETRIEVED CLINICAL KNOWLEDGE BASE CONTEXT:\n${ragContext}\n\nInstructions: Use the retrieved knowledge base context to specifically ground and shape your answer accurately. Do NOT hallucinate medical statistics. If the context does not contain the exact answer, answer conversationally but rely on your foundational clinical guidelines training.\n====================`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDNjzAvZLuYXHtk888dt3B9PVYQg1Dn54Y`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: dynamicSystemPrompt }] },
          contents: [
            ...messages.filter(m => m.role !== "bot" || messages.indexOf(m) !== 0).map(m => ({
              role: m.role === "bot" ? "model" : "user",
              parts: [{ text: m.text }]
            })),
            { role: "user", parts: [{ text: userText }] }
          ],
          generationConfig: { maxOutputTokens: 1000 }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't process that request. Please try again.";
      setMessages(prev => [...prev, { role: "bot", text: botText, disclaimer: false }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "I'm having connectivity issues. Please try again shortly.\n\n⚕️ Disclaimer: This is educational information only. Consult your urologist for personalized medical advice.",
        disclaimer: false
      }]);
    }
    setLoading(false);
  };

  const toggleFAQ = (i) => setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, expanded: !f.expanded } : f));

  const suggestedQuestions = [
    "What is UroLift?",
    "How is IPSS score calculated?",
    "Rezum vs TURP — which is better?",
    "When should I see a urologist?"
  ];

  return (
    <div className="page">
      <div className="section-header">
        <h1>AI Patient Support</h1>
        <p>MIST-AI powered by Claude — ask anything about BPH, MIST procedures, or your symptoms</p>
      </div>

      <div className="chat-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-bot-avatar">🤖</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--navy)" }}>MIST-AI Assistant</div>
                <div className="chat-bot-status"><div className="status-dot" />Online — BPH & MIST Specialist</div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  <div className={`msg-avatar ${m.role}`}>{m.role === "bot" ? "🤖" : "U"}</div>
                  <div className={`msg-bubble ${m.role}`}>
                    {m.text.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-row bot">
                  <div className="msg-avatar bot">🤖</div>
                  <div className="msg-bubble bot"><div className="loading-dots"><span /><span /><span /></div></div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid var(--off-white)" }}>
              {suggestedQuestions.map((q, i) => (
                <button key={i} className="tx-tag" style={{ cursor: "pointer" }} onClick={() => { setInput(q); }}>
                  {q}
                </button>
              ))}
            </div>

            <div className="chat-input-bar">
              <textarea
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about BPH, MIST procedures, or your symptoms..."
                rows={2}
              />
              <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>→</button>
            </div>
          </div>
        </div>

        <div className="faq-sidebar">
          <div className="faq-title-row">
            <div className="card-title" style={{ marginBottom: 0 }}>Auto-Generated FAQs</div>
            <span className="faq-badge">AI-UPDATED</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
            Dynamically generated from chat keyword frequency analysis
          </p>
          {faqs.sort((a, b) => b.freq - a.freq).slice(0, 7).map((faq, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={() => toggleFAQ(i)}>
                <span>{faq.q}</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span className="faq-freq">×{faq.freq}</span>
                  <span style={{ fontSize: 10, color: "var(--cobalt)" }}>{faq.expanded ? "▲" : "▼"}</span>
                </div>
              </div>
              {faq.expanded && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS ──
function Analytics({ history }) {
  const scores = [...history].reverse().map(h => h.score);
  const severityCount = { mild: 0, moderate: 0, severe: 0 };
  history.forEach(h => severityCount[h.severity]++);
  const total = history.length;

  return (
    <div className="page">
      <div className="section-header">
        <h1>Analytics & Trends</h1>
        <p>Longitudinal IPSS analysis and symptom progression tracking</p>
      </div>

      <div className="stats-row">
        {[
          { label: "Average Score", val: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0, icon: "📊" },
          { label: "Peak Score", val: scores.length ? Math.max(...scores) : 0, icon: "📈" },
          { label: "Score Δ (Latest)", val: scores.length > 1 ? (scores[scores.length - 1] - scores[0] > 0 ? '+' : '') + (scores[scores.length - 1] - scores[0]) : 0, icon: "📉" },
          { label: "Months Tracked", val: history.length * 2, icon: "🗓" }
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon blue" style={{ fontSize: 20 }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="card">
          <div className="card-title">IPSS Score History</div>
          <div className="card-sub">Full assessment timeline with severity zones</div>
          <svg viewBox="0 0 500 180" style={{ width: "100%", height: 180, marginTop: 8 }}>
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E4FD8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1E4FD8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Severity zones */}
            <rect x="30" y="130" width="450" height="30" fill="rgba(34,197,94,0.08)" rx="2" />
            <rect x="30" y="70" width="450" height="60" fill="rgba(245,158,11,0.08)" rx="2" />
            <rect x="30" y="10" width="450" height="60" fill="rgba(239,68,68,0.08)" rx="2" />
            <text x="34" y="150" fontSize="9" fill="#22C55E" opacity="0.8">Mild</text>
            <text x="34" y="122" fontSize="9" fill="#F59E0B" opacity="0.8">Moderate</text>
            <text x="34" y="22" fontSize="9" fill="#EF4444" opacity="0.8">Severe</text>

            {(() => {
              const pts = scores.map((v, i) => ({
                x: 40 + (i / (scores.length - 1)) * 440,
                y: 160 - (v / 35) * 150
              }));
              const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              const area = `${path} L${pts[pts.length-1].x},160 L${pts[0].x},160 Z`;
              return (
                <>
                  <path d={area} fill="url(#histGrad)" />
                  <path d={path} fill="none" stroke="#1E4FD8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#1E4FD8" strokeWidth="2" />
                      <text x={p.x} y={p.y - 10} fontSize="10" textAnchor="middle" fill="var(--navy)" fontWeight="600">{scores[i]}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        <div className="card">
          <div className="card-title">Severity Distribution</div>
          <div className="card-sub">Breakdown of assessment outcomes</div>
          <div className="mini-bar-chart" style={{ marginTop: 16 }}>
            {[
              { label: "Severe (20–35)", count: severityCount.severe, color: "var(--severe)" },
              { label: "Moderate (8–19)", count: severityCount.moderate, color: "var(--moderate)" },
              { label: "Mild (0–7)", count: severityCount.mild, color: "var(--mild)" }
            ].map((b, i) => (
              <div className="bar-row" key={i}>
                <span className="bar-label">{b.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(b.count / total) * 100}%`, background: b.color }} />
                </div>
                <span className="bar-val">{b.count}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="card-title" style={{ fontSize: 15 }}>Symptom Velocity</div>
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
              Your IPSS has increased by <strong style={{ color: "var(--severe)" }}>+14 points</strong> over 9 months, suggesting progressive BPH. This rate of change (≈1.6 pts/month) warrants close urological follow-up.
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Complete Assessment Log</div>
        <div className="card-sub">All historical IPSS evaluations with QoL scores</div>
        <table className="history-table">
          <thead>
            <tr>
              <th>Assessment Date</th>
              <th>IPSS Score</th>
              <th>Severity</th>
              <th>QoL Response</th>
              <th>Recommended Pathway</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.date}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15 }}>{h.score}</td>
                <td><span className={`severity-pill ${h.severity}`}>● {h.severity}</span></td>
                <td>{h.qol}</td>
                <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {h.severity === "severe" ? "TURP / HoLEP / Aquablation" : h.severity === "moderate" ? "UroLift / Rezum / 5-ARI" : "Watchful Waiting / Alpha-Blockers"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── DB SCHEMA ──
const SQL = `-- ════════════════════════════════════════════════
-- MIST: IPSS-Based Recommendation System
-- PostgreSQL Database Migration v1.0
-- Normalized to 3NF | All FK constraints enforced
-- ════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLE: users ───────────────────────────────
CREATE TABLE users (
  user_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  full_name      VARCHAR(255) NOT NULL,
  date_of_birth  DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  is_active      BOOLEAN DEFAULT TRUE
);

-- ── TABLE: ipss_assessments ────────────────────
CREATE TABLE ipss_assessments (
  assessment_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  -- Individual question scores (0-5 each, Q7 is nocturia 0-5)
  q1_incomplete    SMALLINT CHECK (q1_incomplete BETWEEN 0 AND 5),
  q2_frequency     SMALLINT CHECK (q2_frequency BETWEEN 0 AND 5),
  q3_intermittency SMALLINT CHECK (q3_intermittency BETWEEN 0 AND 5),
  q4_urgency       SMALLINT CHECK (q4_urgency BETWEEN 0 AND 5),
  q5_weak_stream   SMALLINT CHECK (q5_weak_stream BETWEEN 0 AND 5),
  q6_straining     SMALLINT CHECK (q6_straining BETWEEN 0 AND 5),
  q7_nocturia      SMALLINT CHECK (q7_nocturia BETWEEN 0 AND 5),
  total_score      SMALLINT GENERATED ALWAYS AS
                   (q1_incomplete + q2_frequency + q3_intermittency +
                    q4_urgency + q5_weak_stream + q6_straining + q7_nocturia) STORED,
  severity         VARCHAR(10) GENERATED ALWAYS AS (
                     CASE
                       WHEN (q1_incomplete+q2_frequency+q3_intermittency+
                             q4_urgency+q5_weak_stream+q6_straining+q7_nocturia) <= 7  THEN 'mild'
                       WHEN (q1_incomplete+q2_frequency+q3_intermittency+
                             q4_urgency+q5_weak_stream+q6_straining+q7_nocturia) <= 19 THEN 'moderate'
                       ELSE 'severe'
                     END
                   ) STORED,
  qol_score        SMALLINT CHECK (qol_score BETWEEN 0 AND 6),
  assessed_at      TIMESTAMPTZ DEFAULT NOW(),
  flagged_urgent   BOOLEAN GENERATED ALWAYS AS
                   ((q1_incomplete+q2_frequency+q3_intermittency+
                     q4_urgency+q5_weak_stream+q6_straining+q7_nocturia) >= 20) STORED
);

CREATE INDEX idx_assessments_user ON ipss_assessments(user_id, assessed_at DESC);

-- ── TABLE: treatment_recommendations ──────────
CREATE TABLE treatment_recommendations (
  recommendation_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id      UUID NOT NULL REFERENCES ipss_assessments(assessment_id),
  user_id            UUID NOT NULL REFERENCES users(user_id),
  severity_tier      VARCHAR(10) NOT NULL,
  treatment_name     VARCHAR(255) NOT NULL,
  treatment_abbr     VARCHAR(100),
  guideline_ref      VARCHAR(100),  -- e.g., 'AUA 2023 Guidelines §5.2'
  evidence_level     VARCHAR(10),   -- e.g., 'Level 1', 'Grade A'
  is_primary         BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recs_assessment ON treatment_recommendations(assessment_id);

-- ── TABLE: chat_logs ───────────────────────────
CREATE TABLE chat_logs (
  log_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role         VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  message      TEXT NOT NULL,
  tokens_used  INTEGER,
  model_used   VARCHAR(100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user ON chat_logs(user_id, created_at DESC);
CREATE INDEX idx_chat_fulltext ON chat_logs USING GIN(to_tsvector('english', message));

-- ── TABLE: faq_autogenerated ───────────────────
CREATE TABLE faq_autogenerated (
  faq_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question         TEXT NOT NULL,
  answer           TEXT NOT NULL,
  trigger_keyword  VARCHAR(100),
  frequency_count  INTEGER DEFAULT 1,
  is_approved      BOOLEAN DEFAULT FALSE,
  generated_by     VARCHAR(50) DEFAULT 'keyword_engine',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  last_updated     TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_faq_question ON faq_autogenerated(question);

-- ── AUTO-UPDATE FAQ FUNCTION (Patented Feature) ─
-- Scans chat_logs every hour for top keywords and
-- upserts new FAQ entries via pg_cron
CREATE OR REPLACE FUNCTION refresh_faq_from_chat_logs()
RETURNS void AS $$
DECLARE
  kw RECORD;
BEGIN
  FOR kw IN
    SELECT word, COUNT(*) AS freq
    FROM (
      SELECT regexp_split_to_table(
        lower(message), E'[^a-z]+'
      ) AS word
      FROM chat_logs
      WHERE role = 'user'
        AND created_at > NOW() - INTERVAL '7 days'
    ) words
    WHERE word IN (
      'urolift','rezum','turp','holep','aquablation',
      'bph','ipss','catheter','nocturia','retention'
    )
    GROUP BY word
    HAVING COUNT(*) >= 5
    ORDER BY freq DESC
    LIMIT 10
  LOOP
    INSERT INTO faq_autogenerated (question, answer, trigger_keyword, frequency_count)
    VALUES (
      'Auto: What should I know about ' || kw.word || '?',
      'This FAQ was auto-generated based on ' || kw.freq || ' patient queries about ' || kw.word || '. Please review and approve.',
      kw.word,
      kw.freq
    )
    ON CONFLICT (question) DO UPDATE
      SET frequency_count = kw.freq,
          last_updated = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (requires pg_cron extension):
-- SELECT cron.schedule('faq-refresh', '0 * * * *', 'SELECT refresh_faq_from_chat_logs()');`;

function SchemaPage() {
  const tables = [
    { name: "users", icon: "👤", cols: [
      { name: "user_id", type: "UUID PK", key: "pk" },
      { name: "email", type: "VARCHAR UNIQUE" },
      { name: "password_hash", type: "TEXT" },
      { name: "full_name", type: "VARCHAR" },
      { name: "date_of_birth", type: "DATE" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "is_active", type: "BOOLEAN" },
    ]},
    { name: "ipss_assessments", icon: "📋", cols: [
      { name: "assessment_id", type: "UUID PK", key: "pk" },
      { name: "user_id", type: "UUID FK → users", key: "fk" },
      { name: "q1–q7 scores", type: "SMALLINT × 7" },
      { name: "total_score", type: "GENERATED" },
      { name: "severity", type: "GENERATED" },
      { name: "qol_score", type: "SMALLINT 0–6" },
      { name: "flagged_urgent", type: "GENERATED BOOL" },
      { name: "assessed_at", type: "TIMESTAMPTZ" },
    ]},
    { name: "treatment_recommendations", icon: "💊", cols: [
      { name: "recommendation_id", type: "UUID PK", key: "pk" },
      { name: "assessment_id", type: "UUID FK", key: "fk" },
      { name: "user_id", type: "UUID FK → users", key: "fk" },
      { name: "severity_tier", type: "VARCHAR" },
      { name: "treatment_name", type: "VARCHAR" },
      { name: "guideline_ref", type: "VARCHAR" },
      { name: "evidence_level", type: "VARCHAR" },
      { name: "is_primary", type: "BOOLEAN" },
    ]},
    { name: "chat_logs", icon: "💬", cols: [
      { name: "log_id", type: "UUID PK", key: "pk" },
      { name: "user_id", type: "UUID FK → users", key: "fk" },
      { name: "role", type: "user | assistant" },
      { name: "message", type: "TEXT (GIN indexed)" },
      { name: "tokens_used", type: "INTEGER" },
      { name: "model_used", type: "VARCHAR" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ]},
    { name: "faq_autogenerated", icon: "🤖", cols: [
      { name: "faq_id", type: "UUID PK", key: "pk" },
      { name: "question", type: "TEXT UNIQUE" },
      { name: "answer", type: "TEXT" },
      { name: "trigger_keyword", type: "VARCHAR" },
      { name: "frequency_count", type: "INTEGER" },
      { name: "is_approved", type: "BOOLEAN" },
      { name: "generated_by", type: "VARCHAR" },
      { name: "last_updated", type: "TIMESTAMPTZ" },
    ]},
  ];

  return (
    <div className="page">
      <div className="section-header">
        <h1>Database Schema</h1>
        <p>PostgreSQL 3NF-normalized schema with generated columns and full-text search</p>
      </div>

      <div className="schema-grid">
        {tables.map((t, i) => (
          <div className="schema-table-card" key={i}>
            <div className="schema-table-header">
              <span className="schema-table-icon">{t.icon}</span>
              <span className="schema-table-name">{t.name}</span>
            </div>
            <div className="schema-cols">
              {t.cols.map((c, j) => (
                <div className="schema-col" key={j}>
                  <span className={c.key === "pk" ? "col-key" : c.key === "fk" ? "col-fk" : ""}>
                    {c.key === "pk" ? "🔑 " : c.key === "fk" ? "🔗 " : "   "}{c.name}
                  </span>
                  <span className="col-type">{c.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sql-block">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--sky)" }}>migration_v1.sql</span>
          <span style={{ fontSize: 11, color: "rgba(201,220,239,0.4)" }}>— PostgreSQL 15+ compatible</span>
        </div>
        <pre>{SQL}</pre>
      </div>
    </div>
  );
}

// ── AUTH PAGE ──
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: form.email, 
          password: form.password,
          options: { data: { full_name: form.name } }
        });
        if (error) throw error;
        alert("Check your email for the confirmation link! (Or if email auth is off, you're logged in!)");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, var(--cobalt), var(--sky))", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, boxShadow: "0 8px 24px rgba(30,79,216,0.4)" }}>🏥</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "white" }}>MIST</div>
          <div style={{ fontSize: 12, color: "var(--ice)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>IPSS-Based Recommendation System</div>
        </div>

        <div style={{ background: "var(--navy-mid)", borderRadius: var_radius, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
                background: mode === m ? "var(--cobalt)" : "transparent",
                color: mode === m ? "white" : "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, textTransform: "capitalize"
              }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "var(--ice)", display: "block", marginBottom: 6 }}>Full Name</label>
              <input style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "var(--ice)", display: "block", marginBottom: 6 }}>Email Address</label>
            <input type="email" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="patient@hospital.org" />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "var(--ice)", display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 24px" }} onClick={handleSubmit}>
            {mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
            Demo: click to enter without credentials
          </div>
        </div>
      </div>
    </div>
  );
}

const var_radius = "var(--radius)";

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const fetchHistory = async (userId) => {
      // Upsert profile just in case it's missing (satisfies foreign key)
      await supabase.from('profiles').upsert({ id: userId }).select();
      
      const { data, error } = await supabase
        .from('ipss_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        const formatted = data.map(row => ({
          id: row.id,
          score: row.total_score,
          severity: row.severity.toLowerCase(),
          qol: ['Delighted', 'Pleased', 'Mostly satisfied', 'Mixed', 'Mostly dissatisfied', 'Unhappy', 'Terrible'][row.q8_quality_of_life] || "Mixed",
          date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          answers: {
             0: row.q1_incomplete_emptying,
             1: row.q2_frequency,
             2: row.q3_intermittency,
             3: row.q4_urgency,
             4: row.q5_weak_stream,
             5: row.q6_straining,
             6: row.q7_nocturia
          }
        }));
        setHistory(formatted);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      if (session) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || "Patient" });
        fetchHistory(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      if (session) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || "Patient" });
        fetchHistory(session.user.id);
      } else {
        setUser(null);
        setHistory([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleDeleteAssessment = async (id) => {
    if (!id) {
       alert("This assessment is recently taken and syncing. Please refresh the page before deleting.");
       return;
    }
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDeleteAssessment = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });
    
    setHistory(prev => prev.filter(h => h.id !== id));
    
    const { error } = await supabase
      .from('ipss_assessments')
      .delete()
      .eq('id', id);
      
    if (error) {
      alert("Failed to delete assessment: " + error.message);
    }
  };

  const handleAssessmentComplete = async (result) => {
    // result.answers contains 0-6 index answers Map to our api payload
    const qolIndex = ['Delighted', 'Pleased', 'Mostly satisfied', 'Mixed', 'Mostly dissatisfied', 'Unhappy', 'Terrible'].indexOf(result.qol);
    const payload = {
      q1_incomplete_emptying: result.answers[0],
      q2_frequency: result.answers[1],
      q3_intermittency: result.answers[2],
      q4_urgency: result.answers[3],
      q5_weak_stream: result.answers[4],
      q6_straining: result.answers[5],
      q7_nocturia: result.answers[6],
      q8_quality_of_life: qolIndex > -1 ? qolIndex : 3
    };

    try {
      const { data, error } = await supabase.functions.invoke('calculate-ipss', {
        body: { answers: payload }
      });
      if (error) throw error;
      if (data && data.error) throw new Error(`${data.error} | ${data.details}`);
      
      const properResult = {
        score: data.totalScore,
        severity: data.severity.toLowerCase(),
        qol: result.qol,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        answers: result.answers
      };
      
      setAssessmentResult(properResult);
      setHistory(prev => [properResult, ...prev]);

      // Save to Supabase
      // Note: Insertion into ipss_assessments and treatment_recommendations is handled entirely within the 'calculate-ipss' edge function!
    } catch (err) {
      alert("Error calculating IPSS: " + err.message);
    }
  };

  if (!authed) return (
    <>
      <style>{css}</style>
      <AuthPage />
    </>
  );

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "📊", section: "overview" },
    { id: "assessment", label: "IPSS Assessment", icon: "📋", section: "assessment" },
    { id: "treatments", label: "Treatments", icon: "💊", section: "assessment" },
    { id: "chatbot", label: "AI Support", icon: "🤖", section: "support" },
    { id: "analytics", label: "Analytics", icon: "📈", section: "reports" },
    { id: "schema", label: "DB Schema", icon: "🗄", section: "developer" },
  ];

  const pageTitles = {
    dashboard: { title: "Dashboard", sub: "Clinical overview and recent assessments" },
    assessment: { title: "IPSS Assessment", sub: "International Prostate Symptom Score questionnaire" },
    treatments: { title: "Treatment Pathways", sub: "Evidence-based MIST recommendations" },
    chatbot: { title: "AI Patient Support", sub: "MIST-AI powered BPH assistance" },
    analytics: { title: "Analytics", sub: "Longitudinal symptom analysis" },
    schema: { title: "Database Schema", sub: "PostgreSQL migration and schema viewer" },
  };

  const renderTreatmentsPage = () => {
    const severity = assessmentResult?.severity || "moderate";
    return (
      <div className="page">
        <div className="section-header">
          <h1>Treatment Pathways</h1>
          <p>AUA/EAU guideline-aligned MIST options — {assessmentResult ? `based on your score of ${assessmentResult.score}` : "all severity tiers shown below"}</p>
        </div>
        {["mild", "moderate", "severe"].map(sev => (
          <div key={sev} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span className={`severity-pill ${sev}`}>● {sev.toUpperCase()}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {sev === "mild" ? "IPSS 0–7" : sev === "moderate" ? "IPSS 8–19" : "IPSS 20–35"}
              </span>
            </div>
            <div className="treatment-grid">
              {TREATMENTS[sev].map((t, i) => (
                <div className="treatment-card" key={i} style={{ borderTopColor: sev === "mild" ? "var(--mild)" : sev === "moderate" ? "var(--moderate)" : "var(--severe)" }}>
                  <div className="tx-name">{t.name}</div>
                  <div className="tx-abbr">{t.abbr}</div>
                  <div className="tx-desc">{t.desc}</div>
                  <div className="tx-meta">{t.tags.map((tag, j) => <span className="tx-tag" key={j}>{tag}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="disclaimer">
          ⚕️ <strong>Medical Disclaimer:</strong> All treatment information is derived from published AUA/EAU Clinical Practice Guidelines for BPH. Individual patient suitability varies based on prostate volume, anatomy, comorbidities, medication history, and patient preference. This tool does not replace a consultation with a board-certified urologist.
        </div>
      </div>
    );
  };

  const currentSection = NAV.find(n => n.id === page)?.section || "";
  const sections = [...new Set(NAV.map(n => n.section))];

  return (
    <>
      <style>{css}</style>
      
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ isOpen: false, id: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <div className="modal-title">Delete Assessment</div>
            <div className="modal-desc">Are you sure you want to delete this assessment record? This action is permanent and cannot be undone.</div>
            <div className="modal-actions">
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setDeleteModal({ isOpen: false, id: null })}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", background: "var(--severe)", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }} onClick={confirmDeleteAssessment}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-badge">
              <div className="logo-icon">🏥</div>
              <div className="logo-text">
                <div className="logo-name">MIST</div>
                <div className="logo-sub">BPH · IPSS System</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {sections.map(sec => (
              <div key={sec}>
                <div className="nav-section-label">{sec}</div>
                {NAV.filter(n => n.section === sec).map(n => (
                  <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                    <span className="nav-icon">{n.icon}</span>
                    {n.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div style={{ marginBottom: 4 }}>{user?.name || "Patient"}</div>
            <div style={{ opacity: 0.6 }}>{user?.email || ""}</div>
            <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Sign out</button>
          </div>
        </aside>

        <div className="main-content">
          <div className="top-bar">
            <div>
              <div className="top-bar-title">{pageTitles[page]?.title}</div>
              <div className="top-bar-subtitle">{pageTitles[page]?.sub}</div>
            </div>
            <div className="user-chip">
              <div className="user-avatar">{(user?.name || "P")[0]}</div>
              {user?.name || "Patient"}
            </div>
          </div>

          {page === "dashboard" && <Dashboard onStartAssessment={() => setPage("assessment")} history={history} onDeleteAssessment={handleDeleteAssessment} />}
          {page === "assessment" && <IPSSAssessment onComplete={handleAssessmentComplete} />}
          {page === "treatments" && renderTreatmentsPage()}
          {page === "chatbot" && <ChatBot />}
          {page === "analytics" && <Analytics history={history} />}
          {page === "schema" && <SchemaPage />}
        </div>
      </div>
    </>
  );
}
