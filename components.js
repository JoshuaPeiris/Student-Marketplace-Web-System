// Shared components for campusMarket
const NAV_LINKS = [
  { href: 'index.html', label: 'All' },
  { href: 'listings.html?cat=textbooks', label: '📚 Textbooks' },
  { href: 'listings.html?cat=notes', label: '📝 Notes & Past Papers' },
  { href: 'listings.html?cat=electronics', label: '💻 Electronics' },
  { href: 'listings.html?cat=stationery', label: '✏️ Stationery' },
  { href: 'listings.html?cat=uniforms', label: '👕 Uniforms' },
  { href: 'listings.html?cat=projects', label: '🔧 Project Items' },
  { href: 'listings.html?cat=services', label: '🛠️ Services' },
  { href: 'listings.html?cat=lostfound', label: '🔍 Lost & Found' },
  { href: 'listings.html?cat=food', label: '🍱 Food & Snacks' },
  { href: 'listings.html?cat=free', label: '🎁 Free Stuff' },
];

function renderTopbar() {
  return `<div class="topbar">
    <div><a href="#">Safety Tips</a><a href="#">Help</a><a href="contact.html">Contact</a></div>
  </div>`;
}

function renderHeader(activePage) {
  const navLinks = NAV_LINKS.map(n =>
    `<a href="${n.href}" class="${activePage === n.label ? 'active' : ''}">${n.label}</a>`
  ).join('');
  const saved = JSON.parse(localStorage.getItem('cm_user') || 'null');
  const userArea = saved
    ? `<a href="profile.html">👤 ${saved.name.split(' ')[0]}</a>
       <a href="messages.html">💬 Messages</a>
       <a href="#" onclick="logout()">Logout</a>
       <a href="post-ad.html" class="btn-post">+ Post Ad</a>`
    : `<a href="login.html">Login</a><a href="register.html">Register</a>
       <a href="post-ad.html" class="btn-post">+ Post Ad</a>`;
  return `<div class="header">
    <div class="header-top">
      <a href="index.html" class="logo">campus<span class="hl">Market</span><span class="badge">HNDIT</span></a>
      <div class="search-wrap">
        <input type="text" id="hdr-search" placeholder="Search textbooks, notes, items..." onkeydown="if(event.key==='Enter')doSearch()"/>
        <select id="hdr-zone"><option value="">All Campus</option><option>Block A</option><option>Block B</option><option>Library</option><option>Canteen</option><option>Cafeteria</option></select>
        <button onclick="doSearch()">Search</button>
      </div>
      <div class="header-actions">${userArea}</div>
    </div>
    <nav class="nav-bar">${navLinks}</nav>
  </div>`;
}

function renderFooter() {
  return `<footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo">campus<span class="hl">Market</span></div>
        <p>The official student marketplace for HNDIT 2nd Semester. Buy, sell, swap &amp; share within your campus community safely and easily.</p>
        <div class="footer-social">
          <a href="#">📘</a><a href="#">📸</a><a href="#">💬</a>
        </div>
      </div>
      <div class="footer-col"><h5>Marketplace</h5>
        <a href="listings.html">Browse All</a>
        <a href="post-ad.html">Post an Ad</a>
        <a href="profile.html">My Listings</a>
        <a href="messages.html">Messages</a>
      </div>
      <div class="footer-col"><h5>Categories</h5>
        <a href="listings.html?cat=textbooks">Textbooks</a>
        <a href="listings.html?cat=electronics">Electronics</a>
        <a href="listings.html?cat=services">Services</a>
        <a href="listings.html?cat=free">Free Items</a>
      </div>
      <div class="footer-col"><h5>Campus</h5>
        <a href="contact.html">About Us</a>
        <a href="contact.html">Contact</a>
        <a href="#">Safety Tips</a>
        <a href="#">HNDIT Programme</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 campusMarket — HNDIT 2nd Semester Group Project</span>
      <span>Made with ❤️ for students</span>
    </div>
  </footer>`;
}

function doSearch() {
  const q = document.getElementById('hdr-search')?.value;
  const z = document.getElementById('hdr-zone')?.value;
  if (q) window.location.href = `listings.html?q=${encodeURIComponent(q)}&zone=${encodeURIComponent(z||'')}`;
}

function logout() {
  localStorage.removeItem('cm_user');
  window.location.href = 'index.html';
}

// Category key → emoji map for DB listings
const CAT_EMOJI = {
  textbooks: '📚', notes: '📝', electronics: '💻', stationery: '✏️',
  uniforms: '👕', projects: '🔧', services: '🛠️', food: '🍱',
  lostfound: '🔍', free: '🎁', other: '📦'
};

// Normalise a raw DB listing row so renderListingCard can handle it
function normaliseListing(l) {
  // Already a local sample listing — pass through
  if (l.emoji) return l;

  const catKey = (l.category || 'other').toLowerCase().replace(/[^a-z]/g, '');
  const typeMap = { sell: 'new', swap: 'swap', free: 'free', wanted: 'wanted' };
  const badge = typeMap[(l.listing_type || '').toLowerCase()] || 'new';
  const price = parseFloat(l.price) === 0
    ? (l.listing_type === 'free' ? 'Free' : l.listing_type === 'swap' ? 'Swap' : 'Rs. 0')
    : (l.listing_type === 'wanted'
        ? 'Buying: Rs. ' + parseFloat(l.price).toLocaleString()
        : 'Rs. ' + parseFloat(l.price).toLocaleString());

  const postedAt = l.created_at ? timeAgo(l.created_at) : 'Recently';

  return {
    id: l.id,
    title: l.title || 'Untitled',
    price: price,
    cat: l.category || 'Other',
    badge: badge,
    zone: l.zone || 'Campus',
    emoji: CAT_EMOJI[catKey] || '📦',
    time: postedAt,
    seller: l.seller_name || 'Student',
    year: l.seller_year || '',
    desc: l.description || ''
  };
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + ' min ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hrs ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' days ago';
  return then.toLocaleDateString();
}

function renderListingCard(rawListing) {
  const l = normaliseListing(rawListing);
  return `<div class="listing-card" onclick="window.location='listing-detail.html?id=${l.id}'">
    <div class="listing-thumb"><span>${l.emoji}</span>
      <button class="listing-fav" onclick="event.stopPropagation();toggleFav(this)">♡</button>
    </div>
    <div class="listing-body">
      <span class="badge badge-${l.badge}" style="margin-bottom:6px;display:inline-block">${(l.badge||'new').toUpperCase()}</span>
      <div class="listing-title">${l.title}</div>
      <div class="listing-price">${l.price}</div>
      <div class="listing-meta">📍 ${l.zone} &bull; ${l.time}</div>
    </div>
  </div>`;
}

function toggleFav(btn) {
  btn.classList.toggle('active');
  btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
}

// Sample listings data (used as fallback when DB is empty)
const LISTINGS = [
  { id:1, title:'Programming in C++ Textbook (1st Ed)', price:'Rs. 850', cat:'Textbooks', badge:'new', zone:'Block A', emoji:'📚', time:'2 hrs ago', seller:'Kamal P.', year:'2nd Year', desc:'Good condition, no markings. Perfect for 1st semester students.' },
  { id:2, title:'USB-C Hub 7-in-1 — barely used', price:'Rs. 2,200', cat:'Electronics', badge:'urgent', zone:'Library', emoji:'💻', time:'4 hrs ago', seller:'Nimal S.', year:'3rd Year', desc:'Used only 2 months. All ports working.' },
  { id:3, title:'Database Systems Past Papers 2022–24', price:'Swap / Rs. 150', cat:'Notes', badge:'swap', zone:'Block B', emoji:'📝', time:'Yesterday', seller:'Amara D.', year:'2nd Year', desc:'Full set of past papers with answers.' },
  { id:4, title:'Staedtler Drawing Set (7 pcs)', price:'Rs. 550', cat:'Stationery', badge:'new', zone:'Canteen', emoji:'✏️', time:'1 day ago', seller:'Sahan W.', year:'1st Year', desc:'Brand new set, sealed box.' },
  { id:5, title:'HNDIT Batch Hoodie — Size M', price:'Rs. 1,400', cat:'Uniforms', badge:'new', zone:'Block A', emoji:'👕', time:'2 days ago', seller:'Dilshan R.', year:'2nd Year', desc:'Official batch hoodie, worn twice.' },
  { id:6, title:'Arduino Uno R3 — any condition ok', price:'Buying: Rs. 800', cat:'Project Items', badge:'wanted', zone:'Block B', emoji:'🔧', time:'2 days ago', seller:'Hiruni M.', year:'2nd Year', desc:'Need for semester project, any condition accepted.' },
  { id:7, title:'Scientific Calculator Casio FX-991EX', price:'Rs. 3,500', cat:'Electronics', badge:'new', zone:'Cafeteria', emoji:'🧮', time:'3 days ago', seller:'Tharindu K.', year:'3rd Year', desc:'Like new, box included.' },
  { id:8, title:'Web Design Notes (Printed) — FREE', price:'Free', cat:'Notes', badge:'free', zone:'Block A', emoji:'🎁', time:'3 days ago', seller:'Chathu N.', year:'2nd Year', desc:'Full semester notes, free to good home.' },
  { id:9, title:'Operating Systems — Silberschatz', price:'Rs. 1,100', cat:'Textbooks', badge:'new', zone:'Block B', emoji:'📖', time:'1 day ago', seller:'Ruwan P.', year:'3rd Year', desc:'Minor highlights, great condition.' },
  { id:10, title:'Computer Networks — Tanenbaum 5th Ed', price:'Swap only', cat:'Textbooks', badge:'swap', zone:'Library', emoji:'📗', time:'2 days ago', seller:'Laksha F.', year:'2nd Year', desc:'Looking to swap for OOP or DSA book.' },
  { id:11, title:'Discrete Mathematics (Rosen)', price:'Rs. 750', cat:'Textbooks', badge:'new', zone:'Block A', emoji:'📕', time:'3 days ago', seller:'Nimasha C.', year:'1st Year', desc:'Used one semester, very good condition.' },
  { id:12, title:'Java: Complete Reference — Schildt', price:'Rs. 950', cat:'Textbooks', badge:'urgent', zone:'Canteen', emoji:'📘', time:'4 days ago', seller:'Kasun E.', year:'2nd Year', desc:'Urgent sale, leaving hostel.' },
];
