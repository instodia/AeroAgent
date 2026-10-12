// AeroAgent Website Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  const CONTACT_EMAIL = 'contact@akturesult.in';

  // 1. Current Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Toast Notification Function
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('active');
    
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  // 3. Email Copy Functionality
  function copyEmailToClipboard(triggerBtn, feedbackSpan) {
    navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      showToast(`Copied ${CONTACT_EMAIL} to clipboard!`);
      if (feedbackSpan) {
        const originalText = feedbackSpan.textContent;
        feedbackSpan.textContent = 'Copied!';
        setTimeout(() => {
          feedbackSpan.textContent = originalText;
        }, 2000);
      }
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = CONTACT_EMAIL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(`Copied ${CONTACT_EMAIL} to clipboard!`);
    });
  }

  // Hero Copy Button
  const heroCopyBtn = document.getElementById('btn-copy-hero-email');
  const heroCopyFeedback = document.getElementById('copy-feedback-text');
  if (heroCopyBtn) {
    heroCopyBtn.addEventListener('click', () => {
      copyEmailToClipboard(heroCopyBtn, heroCopyFeedback);
    });
  }

  // Contact Card Copy Button
  const cardCopyBtn = document.getElementById('btn-copy-card-email');
  const cardCopyFeedback = document.getElementById('card-copy-text');
  if (cardCopyBtn) {
    cardCopyBtn.addEventListener('click', () => {
      copyEmailToClipboard(cardCopyBtn, cardCopyFeedback);
    });
  }

  // 4. Interactive Waitlist Forms
  const heroWaitlistForm = document.getElementById('waitlist-form');
  const heroWaitlistEmail = document.getElementById('waitlist-email');

  if (heroWaitlistForm) {
    heroWaitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = heroWaitlistEmail.value.trim();
      if (email) {
        saveEmailToWaitlist(email);
        heroWaitlistEmail.value = '';
        showToast('🎉 You have been added to the private beta list!');
      }
    });
  }

  const cardWaitlistForm = document.getElementById('card-waitlist-form');
  const cardWaitlistEmail = document.getElementById('card-waitlist-email');
  const cardSuccessMsg = document.getElementById('waitlist-success-msg');

  if (cardWaitlistForm) {
    cardWaitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = cardWaitlistEmail.value.trim();
      if (email) {
        saveEmailToWaitlist(email);
        cardWaitlistEmail.value = '';
        if (cardSuccessMsg) {
          cardSuccessMsg.style.display = 'block';
        }
        showToast('🎉 Added to waitlist! We will notify you.');
      }
    });
  }

  function saveEmailToWaitlist(email) {
    try {
      const existing = JSON.parse(localStorage.getItem('aeroagent_waitlist') || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('aeroagent_waitlist', JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  // 5. Interactive Simulation Console Step Cycling
  const stepStatusEl = document.getElementById('console-step-status');
  const typingCmdEl = document.getElementById('typing-command');

  const demoScenarios = [
    {
      cmd: 'aeroagent run --task "Extract verified research data & autofill report"',
      status: 'Autonomous Agent navigating pages safely under client supervision...'
    },
    {
      cmd: 'aeroagent run --task "Check multi-vendor hardware pricing & alert"',
      status: 'DOM parsed locally • Zero cookies or auth tokens dispatched.'
    },
    {
      cmd: 'aeroagent run --task "Fill multi-page regulatory application form"',
      status: 'Paused: Requesting human-in-the-loop 1-click confirmation before submit.'
    },
    {
      cmd: 'aeroagent run --task "Verify flight changes & synchronize calendar"',
      status: 'Session encrypted in-memory. Execution successful (0ms data egress).'
    }
  ];

  let scenarioIndex = 0;
  if (stepStatusEl && typingCmdEl) {
    setInterval(() => {
      scenarioIndex = (scenarioIndex + 1) % demoScenarios.length;
      stepStatusEl.style.opacity = '0';
      typingCmdEl.style.opacity = '0';
      
      setTimeout(() => {
        typingCmdEl.textContent = demoScenarios[scenarioIndex].cmd;
        stepStatusEl.textContent = demoScenarios[scenarioIndex].status;
        stepStatusEl.style.opacity = '1';
        typingCmdEl.style.opacity = '1';
      }, 300);
    }, 4500);
  }
});
