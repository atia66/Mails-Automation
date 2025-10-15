// Global State
let currentFilter = "all";
let currentSort = "newest";
let isChatOpen = false;
let isDarkMode = true;
let isSidebarOpen = window.innerWidth > 768;
let notifications = [];

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  initializeParticles();
  loadNotifications();
  initializeSearch();
  updateStats();
  setInterval(updateTimestamps, 60000);

  // Auto-hide mobile sidebar on resize
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      document.getElementById("sidebar").classList.remove("mobile-open");
      isSidebarOpen = false;
    }
  });
});

// Particle System
function initializeParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = Math.random() * 3 + 3 + "s";
    particlesContainer.appendChild(particle);
  }
}

// Sidebar Functions
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  isSidebarOpen = !isSidebarOpen;

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("mobile-open", isSidebarOpen);
  }
}

function toggleProfileMenu() {
  // Profile menu functionality
  showToast("Profile menu opened", "info");
}

// Search Functions
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  let searchTimeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchNotifications(this.value);
    }, 300);
  });
}

function searchNotifications(query) {
  const cards = document.querySelectorAll(".notification-card");
  const lowerQuery = query.toLowerCase();

  cards.forEach((card) => {
    const subject = card
      .querySelector(".notification-subject")
      .textContent.toLowerCase();
    const preview = card
      .querySelector(".notification-preview")
      .textContent.toLowerCase();
    const sender = card.querySelector(".sender-name").textContent.toLowerCase();

    const matches =
      subject.includes(lowerQuery) ||
      preview.includes(lowerQuery) ||
      sender.includes(lowerQuery);

    card.style.display = matches ? "block" : "none";
  });
}

// Filter Functions
function filterNotifications(type) {
  currentFilter = type;
  const cards = document.querySelectorAll(".notification-card");

  // Update active nav
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.closest(".nav-link").classList.add("active");

  cards.forEach((card) => {
    let show = true;

    switch (type) {
      case "unread":
        show = card.dataset.read === "false";
        break;
      case "starred":
        show = card.dataset.starred === "true";
        break;
      case "priority":
        show =
          card.dataset.priority === "high" ||
          card.dataset.priority === "medium";
        break;
      case "all":
      default:
        show = true;
        break;
    }

    card.style.display = show ? "block" : "none";
  });

  updatePageTitle(type);
}

function filterByCategory(category) {
  const cards = document.querySelectorAll(".notification-card");

  // Update active nav
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.closest(".nav-link").classList.add("active");

  cards.forEach((card) => {
    const show = card.classList.contains(category);
    card.style.display = show ? "block" : "none";
  });

  updatePageTitle(category);
}

function updatePageTitle(filter) {
  const title = document.querySelector(".page-title");
  const filterNames = {
    all: "All Notifications",
    unread: "Unread Notifications",
    starred: "Starred Notifications",
    priority: "Priority Notifications",
    message: "Messages",
    alert: "Alerts",
    system: "System Notifications",
    social: "Social Notifications",
  };

  title.textContent = filterNames[filter] || "Notifications";
}

// Sort Functions
function sortNotifications() {
  const select = document.getElementById("sortSelect");
  const grid = document.getElementById("notificationsGrid");
  const cards = Array.from(grid.querySelectorAll(".notification-card"));

  cards.sort((a, b) => {
    switch (select.value) {
      case "oldest":
        return getTimestamp(a) - getTimestamp(b);
      case "priority":
        return getPriorityValue(b) - getPriorityValue(a);
      case "sender":
        return getSenderName(a).localeCompare(getSenderName(b));
      case "unread":
        return (b.dataset.read === "false") - (a.dataset.read === "false");
      case "newest":
      default:
        return getTimestamp(b) - getTimestamp(a);
    }
  });

  cards.forEach((card) => grid.appendChild(card));
}

function getTimestamp(card) {
  const timeText = card.querySelector(".notification-time").textContent;
  // Simple timestamp parsing for demo
  if (timeText.includes("minutes")) return parseInt(timeText);
  if (timeText.includes("hour")) return parseInt(timeText) * 60;
  if (timeText.includes("day")) return parseInt(timeText) * 1440;
  return 0;
}

function getPriorityValue(card) {
  const priority = card.dataset.priority;
  return priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

function getSenderName(card) {
  return card.querySelector(".sender-name").textContent;
}

// Card Action Functions
function toggleStar(button) {
  const card = button.closest(".notification-card");
  const isStarred = card.dataset.starred === "true";

  card.dataset.starred = !isStarred;
  button.classList.toggle("starred", !isStarred);

  updateStats();
  showToast(isStarred ? "Removed from starred" : "Added to starred", "success");
}

function toggleRead(button) {
  const card = button.closest(".notification-card");
  const isRead = card.dataset.read === "true";

  card.dataset.read = !isRead;
  button.classList.toggle("active", !isRead);

  updateStats();
  showToast(isRead ? "Marked as unread" : "Marked as read", "success");
}

function showCardMenu(button) {
  // Context menu functionality
  showToast("Context menu opened", "info");
}

// Notification Actions
function replyToNotification(button) {
  const card = button.closest(".notification-card");
  const sender = card.querySelector(".sender-name").textContent;
  showToast(`Reply to ${sender}`, "info");
}

function forwardNotification(button) {
  const card = button.closest(".notification-card");
  showToast("Forward dialog opened", "info");
}

function archiveNotification(button) {
  const card = button.closest(".notification-card");
  card.style.opacity = "0.5";
  card.style.transform = "scale(0.95)";

  setTimeout(() => {
    card.remove();
    updateStats();
    showToast("Notification archived", "success");
  }, 300);
}

function snoozeNotification(button) {
  const card = button.closest(".notification-card");
  const time = prompt("Snooze for how many minutes?", "30");

  if (time && !isNaN(time)) {
    card.style.opacity = "0.6";
    showToast(`Snoozed for ${time} minutes`, "success");
  }
}

function deleteNotification(button) {
  if (confirm("Are you sure you want to delete this notification?")) {
    const card = button.closest(".notification-card");
    card.style.opacity = "0";
    card.style.transform = "scale(0.8) translateY(-20px)";

    setTimeout(() => {
      card.remove();
      updateStats();
      showToast("Notification deleted", "success");
    }, 300);
  }
}

// Specialized Actions
function viewDetails(button) {
  showToast("Opening detailed view", "info");
}

function secureAccount(button) {
  showToast("Opening security settings", "info");
}

function dismissAlert(button) {
  const card = button.closest(".notification-card");
  archiveNotification(button);
}

function updateSystem(button) {
  const card = button.closest(".notification-card");
  showToast("System update started", "success");
  card.style.opacity = "0.6";
}

function viewChangelog(button) {
  showToast("Opening changelog", "info");
}

function scheduleUpdate(button) {
  const time = prompt(
    'Schedule update for when? (e.g., "tonight at 2 AM")',
    "tonight at 2 AM"
  );
  if (time) {
    showToast(`Update scheduled for ${time}`, "success");
  }
}

function openDocument(button) {
  showToast("Opening document in new tab", "info");
}

function downloadDocument(button) {
  showToast("Document download started", "success");
}

function shareDocument(button) {
  showToast("Share dialog opened", "info");
}

// Bulk Actions
function markAllRead() {
  const cards = document.querySelectorAll(
    '.notification-card[data-read="false"]'
  );
  let count = 0;

  cards.forEach((card) => {
    card.dataset.read = "true";
    const readBtn = card.querySelector(
      ".card-actions .card-action-btn:nth-child(2)"
    );
    readBtn.classList.add("active");
    count++;
  });

  updateStats();
  showToast(`${count} notifications marked as read`, "success");
}

function refreshNotifications() {
  const refreshBtn = event.target.closest(".toolbar-btn");
  refreshBtn.style.transform = "rotate(360deg)";

  setTimeout(() => {
    refreshBtn.style.transform = "rotate(0deg)";
    showToast("Notifications refreshed", "success");
    updateStats();
  }, 600);
}

// View Functions
function toggleView(viewType) {
  const buttons = document.querySelectorAll(".toolbar .toolbar-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  event.target.closest(".toolbar-btn").classList.add("active");

  const grid = document.getElementById("notificationsGrid");

  if (viewType === "list") {
    grid.style.gridTemplateColumns = "1fr";
    grid.style.gap = "16px";
  } else {
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(400px, 1fr))";
    grid.style.gap = "24px";
  }

  showToast(`Switched to ${viewType} view`, "info");
}

// Theme Functions
function toggleTheme() {
  const toggle = event.target;
  isDarkMode = !isDarkMode;
  toggle.classList.toggle("dark", isDarkMode);

  // Theme switching would be implemented here
  showToast(`Switched to ${isDarkMode ? "dark" : "light"} mode`, "info");
}

// Chat Functions
function toggleChat() {
  const chatWidget = document.getElementById("chatWidget");
  isChatOpen = !isChatOpen;

  chatWidget.classList.toggle("active", isChatOpen);

  if (isChatOpen) {
    document.getElementById("chatInput").focus();
  }
}

function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) return;

  addChatMessage(message, "user");
  input.value = "";

  // Simulate AI response
  setTimeout(() => {
    const responses = [
      "I can help you manage your notifications more efficiently. What would you like to do?",
      "I notice you have several unread messages. Would you like me to summarize them?",
      "You can use voice commands like 'mark all as read' or 'show priority notifications'.",
      "I can help you set up smart filters and automated responses. Interested?",
      "Based on your notification patterns, I recommend organizing by priority. Shall I set that up?",
      "I can create custom notification rules based on sender, keywords, or time. What works best for you?",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    addChatMessage(randomResponse, "bot");
  }, 1000);
}

function addChatMessage(message, type) {
  const messagesContainer = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${type}`;
  messageDiv.textContent = message;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Composer Functions
function openComposer() {
  showModal(
    "Compose New Notification",
    `
                <div style="padding: 24px;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">To:</label>
                        <input type="text" placeholder="Enter recipients..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--glass-bg); color: var(--text-primary);">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Subject:</label>
                        <input type="text" placeholder="Enter subject..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--glass-bg); color: var(--text-primary);">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Priority:</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--glass-bg); color: var(--text-primary);">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Message:</label>
                        <textarea rows="6" placeholder="Enter your message..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--glass-bg); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button onclick="closeModal()" style="padding: 12px 24px; background: var(--glass-bg); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer;">Cancel</button>
                        <button onclick="sendNotification()" style="padding: 12px 24px; background: var(--primary-gradient); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">Send</button>
                    </div>
                </div>
            `
  );
}

function quickCompose() {
  showToast("Quick compose opened", "info");
  openComposer();
}

function sendNotification() {
  closeModal();
  showToast("Notification sent successfully", "success");
}

// Settings and Tools
function openSettings() {
  showModal(
    "Settings",
    `
                <div style="padding: 24px;">
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 16px;">Notification Settings</h3>
                        <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox" checked> Desktop notifications
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox" checked> Email notifications
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox"> SMS notifications
                        </label>
                    </div>
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 16px;">Display Settings</h3>
                        <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox" checked> Show timestamps
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox" checked> Group by category
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox"> Compact view
                        </label>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button onclick="closeModal()" style="padding: 12px 24px; background: var(--glass-bg); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer;">Cancel</button>
                        <button onclick="saveSettings()" style="padding: 12px 24px; background: var(--primary-gradient); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">Save</button>
                    </div>
                </div>
            `
  );
}

function openAnalytics() {
  showModal(
    "Analytics Dashboard",
    `
                <div style="padding: 24px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--text-primary);">142</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Total Notifications</div>
                        </div>
                        <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--text-primary);">89%</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Read Rate</div>
                        </div>
                        <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--text-primary);">2.3m</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Avg Response Time</div>
                        </div>
                    </div>
                    <div style="text-align: center; color: var(--text-secondary); margin: 40px 0;">
                        <i class="fas fa-chart-line" style="font-size: 48px; opacity: 0.3;"></i>
                        <p>Detailed analytics coming soon...</p>
                    </div>
                    <div style="display: flex; justify-content: flex-end;">
                        <button onclick="closeModal()" style="padding: 12px 24px; background: var(--primary-gradient); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">Close</button>
                    </div>
                </div>
            `
  );
}

function exportData() {
  showToast(
    "Export started - you will receive a download link shortly",
    "success"
  );
}

function saveSettings() {
  closeModal();
  showToast("Settings saved successfully", "success");
}

// Utility Functions
function updateStats() {
  const cards = document.querySelectorAll(".notification-card");
  const unreadCount = document.querySelectorAll(
    '.notification-card[data-read="false"]'
  ).length;
  const starredCount = document.querySelectorAll(
    '.notification-card[data-starred="true"]'
  ).length;
  const priorityCount = document.querySelectorAll(
    '.notification-card[data-priority="high"], .notification-card[data-priority="medium"]'
  ).length;

  // Update sidebar stats
  const statCards = document.querySelectorAll(".stat-card .stat-number");
  if (statCards[0]) statCards[0].textContent = cards.length;
  if (statCards[1]) statCards[1].textContent = unreadCount;
  if (statCards[2]) statCards[2].textContent = priorityCount;

  // Update navigation badges
  const badges = {
    all: cards.length,
    unread: unreadCount,
    starred: starredCount,
    priority: priorityCount,
  };

  document.querySelectorAll(".nav-badge").forEach((badge, index) => {
    const keys = Object.keys(badges);
    if (keys[index]) {
      badge.textContent = badges[keys[index]];
    }
  });
}

function updateTimestamps() {
  // Update relative timestamps
  document.querySelectorAll(".notification-time").forEach((timeElement) => {
    // In a real app, this would calculate actual relative times
    // For demo purposes, we'll leave them as is
  });
}

function loadNotifications() {
  // In a real app, this would load from an API
  updateStats();
}

function showModal(title, content) {
  const modal = document.createElement("div");
  modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
                display: flex; align-items: center; justify-content: center; 
                z-index: 10000; animation: fadeIn 0.3s ease;
            `;

  modal.innerHTML = `
                <div style="background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 16px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div style="padding: 24px 24px 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">${title}</h2>
                        <button onclick="closeModal()" style="background: transparent; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 4px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ${content}
                </div>
            `;

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  document.body.appendChild(modal);
  window.currentModal = modal;
}

function closeModal() {
  if (window.currentModal) {
    window.currentModal.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(window.currentModal);
      window.currentModal = null;
    }, 300);
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  const colors = {
    success: "#56ab2f",
    error: "#ef4444",
    warning: "#ffa726",
    info: "#ff6b6b",
  };

  toast.style.cssText = `
                position: fixed; top: 24px; right: 24px; 
                background: var(--sidebar-bg); backdrop-filter: blur(20px);
                color: var(--text-primary); padding: 16px 24px; 
                border-radius: 12px; border: 1px solid var(--border-color);
                border-left: 4px solid ${colors[type]};
                box-shadow: 0 8px 24px var(--shadow-dark);
                z-index: 10000; font-weight: 600; font-size: 14px;
                animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
                max-width: 300px;
            `;

  toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-${
                      type === "success"
                        ? "check"
                        : type === "error"
                        ? "times"
                        : type === "warning"
                        ? "exclamation"
                        : "info"
                    }-circle" style="color: ${colors[type]};"></i>
                    <span>${message}</span>
                </div>
            `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

// CSS Animations for modals and toasts
const style = document.createElement("style");
style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
document.head.appendChild(style);

// Initialize tooltips and other interactive elements
document.addEventListener("mouseover", function (e) {
  if (
    e.target.hasAttribute("title") &&
    !e.target.getAttribute("data-tooltip-added")
  ) {
    e.target.setAttribute("data-tooltip-added", "true");
    // Tooltip functionality would be implemented here
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + K for search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }

  // Escape to close modals/chat
  if (e.key === "Escape") {
    if (window.currentModal) closeModal();
    if (isChatOpen) toggleChat();
  }

  // Ctrl/Cmd + N for new notification
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    openComposer();
  }
});

// Auto-save preferences
function savePreference(key, value) {
  // In a real app, this would save to localStorage or server
  console.log(`Saving preference: ${key} = ${value}`);
}

// Performance optimization for large notification lists
function optimizeRendering() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.visibility = "visible";
        } else {
          entry.target.style.visibility = "hidden";
        }
      });
    },
    { rootMargin: "100px" }
  );

  document.querySelectorAll(".notification-card").forEach((card) => {
    observer.observe(card);
  });
}

// Real-time updates simulation
function simulateRealTimeUpdates() {
  setInterval(() => {
    if (Math.random() < 0.1) {
      // 10% chance every interval
      const newNotificationCount = Math.floor(Math.random() * 3) + 1;
      showToast(
        `${newNotificationCount} new notification${
          newNotificationCount > 1 ? "s" : ""
        } received`,
        "info"
      );
      updateStats();
    }
  }, 30000); // Check every 30 seconds
}

// Start real-time simulation after page load
setTimeout(simulateRealTimeUpdates, 5000);
