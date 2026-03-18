// ═══════════════════════════════════════════════════════════════
//  auth.js  —  Capy AI shared authentication module
//  Add <script src="auth.js"></script> to index.html (before </body>)
//  Also add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ═══════════════════════════════════════════════════════════════

// ── Config (same values as login.html) ───────────────────────
const SUPABASE_URL  = 'https://pdqrcnfwslufajwjivaq.supabase.co';
const SUPABASE_ANON = 'sb_publishable_EESffuJVtBIQ_2UTMj2TnA_JEUP4pPU';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ═══════════════════════════════════════════════════════════════
//  updateNavUI(user)
//  Swaps the "Start Free" nav button for an avatar + dropdown
// ═══════════════════════════════════════════════════════════════
function updateNavUI(user) {
  // Find the "Start Free" nav link — it links to #app-section
  const startFreeBtn = document.querySelector('a[href="#app-section"].nav-cta');

  if (!startFreeBtn) return; // safety check

  if (user) {
    // ── Logged in: show avatar ─────────────────────────────
    const avatarUrl = user.user_metadata?.avatar_url || '';
    const name      = user.user_metadata?.full_name   || user.email;
    const initials  = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

    startFreeBtn.outerHTML = `
      <div class="nav-user" id="navUser">
        <button class="nav-avatar-btn" id="avatarBtn" onclick="toggleUserMenu()">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="${name}" class="nav-avatar-img" />`
            : `<div class="nav-avatar-initials">${initials}</div>`
          }
          <span class="nav-username">${name.split(' ')[0]}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="opacity:0.5">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="nav-dropdown" id="userDropdown">
          <div class="dropdown-header">
            <div class="dropdown-name">${name}</div>
            <div class="dropdown-email">${user.email}</div>
          </div>
          <div class="dropdown-ops" id="dropdownOps">
            <span class="ops-count" id="opsRemaining">—</span>
            <span class="ops-label">operations left</span>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" onclick="window.location.href='#plans-section'">⚡ Upgrade Plan</button>
          <button class="dropdown-item" onclick="viewHistory()">📋 Caption History</button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="signOut()">Sign Out</button>
        </div>
      </div>
    `;

    // Inject styles if not already added
    if (!document.getElementById('capyAuthStyles')) {
      const style = document.createElement('style');
      style.id = 'capyAuthStyles';
      style.textContent = `
        /* ── Nav user widget ── */
        .nav-user { position: relative; }

        .nav-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 6px 14px 6px 6px;
          cursor: pointer;
          color: #f0f0f0;
          font-family: inherit;
          font-size: 0.85rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .nav-avatar-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }

        .nav-avatar-img {
          width: 28px; height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }
        .nav-avatar-initials {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f5c842, #ff6b35);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          color: #000;
        }

        /* ── Dropdown ── */
        .nav-dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: #141418;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
          z-index: 999;
          animation: dropIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .nav-dropdown.open { display: block; }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dropdown-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .dropdown-name  { font-size: 0.85rem; font-weight: 600; color: #f0f0f0; }
        .dropdown-email { font-size: 0.75rem; color: #666; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .dropdown-ops {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(245,200,66,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ops-count { font-size: 1.1rem; font-weight: 700; color: #f5c842; }
        .ops-label { font-size: 0.75rem; color: #888; }

        .dropdown-divider { height: 1px; background: rgba(255,255,255,0.07); }

        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 11px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.83rem;
          color: #bbb;
          font-family: inherit;
          transition: background 0.15s, color 0.15s;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); color: #f0f0f0; }
        .dropdown-item.danger:hover { background: rgba(255,60,60,0.08); color: #ff6b6b; }
      `;
      document.head.appendChild(style);
    }

    // Load operation count
    loadOpsCount(user.id);

  } else {
    // ── Logged out: restore "Start Free" button ────────────
    const navUser = document.getElementById('navUser');
    if (navUser) {
      navUser.outerHTML = `<a href="#app-section" class="nav-cta">Start Free</a>`;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  toggleUserMenu()  —  open / close the dropdown
// ═══════════════════════════════════════════════════════════════
function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  dd.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('#navUser')) {
    document.getElementById('userDropdown')?.classList.remove('open');
  }
});

// ═══════════════════════════════════════════════════════════════
//  loadOpsCount(userId)  —  fetch remaining ops from Supabase
// ═══════════════════════════════════════════════════════════════
async function loadOpsCount(userId) {
  const el = document.getElementById('opsRemaining');
  if (!el) return;

  const { data, error } = await sb
    .from('user_usage')
    .select('ops_used, ops_limit')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    el.textContent = '10'; // default free tier
    return;
  }

  const remaining = Math.max(0, data.ops_limit - data.ops_used);
  el.textContent = remaining;
}

// ═══════════════════════════════════════════════════════════════
//  signOut()  —  log the user out and refresh UI
// ═══════════════════════════════════════════════════════════════
async function signOut() {
  await sb.auth.signOut();
  window.location.reload();
}

// ═══════════════════════════════════════════════════════════════
//  viewHistory()  —  placeholder (you can build this later!)
// ═══════════════════════════════════════════════════════════════
function viewHistory() {
  alert('Caption history coming soon! 📋');
}

// ═══════════════════════════════════════════════════════════════
//  decrementOp(userId)  —  call this after each caption operation
//  Returns: { allowed: true/false, remaining: number }
// ═══════════════════════════════════════════════════════════════
async function decrementOp(userId) {
  // 1. Get current usage
  let { data, error } = await sb
    .from('user_usage')
    .select('ops_used, ops_limit')
    .eq('user_id', userId)
    .single();

  // 2. If no row yet, create one (first-time user)
  if (error || !data) {
    await sb.from('user_usage').insert({
      user_id:   userId,
      ops_used:  0,
      ops_limit: 10
    });
    data = { ops_used: 0, ops_limit: 10 };
  }

  const remaining = data.ops_limit - data.ops_used;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0 };
  }

  // 3. Increment ops_used
  await sb.from('user_usage')
    .update({ ops_used: data.ops_used + 1 })
    .eq('user_id', userId);

  return { allowed: true, remaining: remaining - 1 };
}

// ═══════════════════════════════════════════════════════════════
//  BOOT  —  check session and wire up nav on page load
// ═══════════════════════════════════════════════════════════════
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  updateNavUI(session?.user ?? null);

  // Also handle the "Start Free" / "Try for Free" CTA in the hero section
  // Keep UI in sync if session changes (e.g. after redirect from Google)
  sb.auth.onAuthStateChange((_event, session) => {
    updateNavUI(session?.user ?? null);
  });
})();
