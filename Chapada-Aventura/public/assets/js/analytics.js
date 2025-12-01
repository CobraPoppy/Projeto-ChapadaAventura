import { getCurrentUser } from "./users.js";

const ANALYTICS_KEY = "chapada_analytics_v2";

function loadAnalytics() {
  if (typeof window === "undefined" || !window.localStorage) return { users: {} };
  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return { users: {} };
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = {};
    return parsed;
  } catch {
    return { users: {} };
  }
}

function saveAnalytics(data) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function ensureUser(data, user) {
  if (!user || !user.email) return null;
  if (!data.users[user.email]) {
    data.users[user.email] = {
      email: user.email,
      name: user.name || "",
      createdAt: user.createdAt || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      pages: {}
    };
  } else {
    data.users[user.email].name = user.name || data.users[user.email].name;
    data.users[user.email].lastSeen = new Date().toISOString();
  }
  return data.users[user.email];
}

function ensurePage(userObj, pageId) {
  if (!userObj.pages[pageId]) {
    userObj.pages[pageId] = {
      pageId,
      views: 0,
      totalTimeMs: 0,
      interactions: {
        contactSubmit: 0,
        register: 0,
        login: 0
      }
    };
  }
  return userObj.pages[pageId];
}

export function trackPageView(pageId) {
  const user = getCurrentUser();
  if (!user) return;
  const data = loadAnalytics();
  const u = ensureUser(data, user);
  if (!u) return;
  const p = ensurePage(u, pageId);
  p.views += 1;
  saveAnalytics(data);
}

export function trackTimeSpent(pageId, ms) {
  if (!ms || ms < 0) return;
  const user = getCurrentUser();
  if (!user) return;
  const data = loadAnalytics();
  const u = ensureUser(data, user);
  if (!u) return;
  const p = ensurePage(u, pageId);
  p.totalTimeMs += ms;
  saveAnalytics(data);
}

export function trackInteraction(pageId, type) {
  const user = getCurrentUser();
  if (!user) return;
  const data = loadAnalytics();
  const u = ensureUser(data, user);
  if (!u) return;
  const p = ensurePage(u, pageId);
  if (!p.interactions[type]) {
    p.interactions[type] = 0;
  }
  p.interactions[type] += 1;
  saveAnalytics(data);
}

export function initPageTracking(pageId) {
  const start = Date.now();
  trackPageView(pageId);

  function handle() {
    const elapsed = Date.now() - start;
    trackTimeSpent(pageId, elapsed);
  }

  window.addEventListener("beforeunload", handle);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handle();
    }
  });
}

export function getAnalytics() {
  return loadAnalytics();
}
