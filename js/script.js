// ===== SHEETDB CONFIGURATION =====
const SHEETDB_REVIEW_ENDPOINT = 'https://sheetdb.io/api/v1/rmmrh2rywkbgm';
const SHEETDB_CONTACT_ENDPOINT = 'https://sheetdb.io/api/v1/w5yase2aernb1';

// ===== REVIEW MANAGEMENT FUNCTIONS =====

// Function to load and display reviews
async function loadReviews() {
  const refreshBtn = document.getElementById('refresh-reviews');
  const originalText = refreshBtn ? refreshBtn.innerHTML : '';
  
  // Show loading state
  if (refreshBtn) {
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
    refreshBtn.disabled = true;
  }
  
  try {
    const response = await fetch(SHEETDB_REVIEW_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reviews = await response.json();
    
    const reviewsContainer = document.querySelector('#endorsements .row.justify-content-center');
    const noReviewsCard = document.getElementById('no-reviews-card');
    
    if (reviews && Array.isArray(reviews) && reviews.length > 0) {
      // Hide the no reviews card
      if (noReviewsCard) {
        noReviewsCard.classList.add('d-none');
      }
      
      // Remove existing static review cards (keep only the no-reviews card)
      const existingCards = reviewsContainer.querySelectorAll('.col-lg-4');
      existingCards.forEach(card => {
        if (!card.id || card.id !== 'no-reviews-card') {
          card.remove();
        }
      });
      
      // Also remove any static-review cards specifically
      const staticReviews = reviewsContainer.querySelectorAll('.static-review');
      staticReviews.forEach(card => card.remove());
      
      // Sort reviews by date (newest first)
      const sortedReviews = reviews.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      });
      
      // Display only 4 most recent reviews
      const recentReviews = sortedReviews.slice(0, 4);
      recentReviews.forEach(review => {
        const reviewCard = createReviewCard(review);
        reviewsContainer.appendChild(reviewCard);
      });
      
      // Create older reviews section if there are more than 4 reviews
      if (sortedReviews.length > 4) {
        createOlderReviewsSection(sortedReviews.slice(4));
      } else {
        // Remove older reviews section if it exists
        const existingOlderSection = document.getElementById('older-reviews-section');
        if (existingOlderSection) {
          existingOlderSection.remove();
        }
      }
    } else {
      // Show no reviews card if no reviews exist
      if (noReviewsCard) {
        noReviewsCard.classList.remove('d-none');
      }
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error loading reviews. Please try again.', 'error');
    }
  } finally {
    // Reset button state
    if (refreshBtn) {
      refreshBtn.innerHTML = originalText;
      refreshBtn.disabled = false;
    }
  }
}

// Function to create older reviews section
function createOlderReviewsSection(olderReviews) {
  // Remove existing older reviews section if it exists
  const existingOlderSection = document.getElementById('older-reviews-section');
  if (existingOlderSection) {
    existingOlderSection.remove();
  }
  
  // Create new older reviews section
  const olderSection = document.createElement('section');
  olderSection.id = 'older-reviews-section';
  olderSection.className = 'py-5 bg-light-custom';
  
  olderSection.innerHTML = `
    <div class="container" data-aos="fade-up">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <h3 class="display-6 fw-bold mb-0">Previous Reviews</h3>
        <button class="btn btn-outline-secondary btn-sm" onclick="toggleOlderReviews()">
          <i class="fas fa-chevron-down me-1" id="toggle-icon"></i>
          <span id="toggle-text">Show All</span>
        </button>
      </div>
      <div class="row justify-content-center" id="older-reviews-container" style="display: none;">
        ${olderReviews.map(review => {
          const reviewCard = createReviewCard(review);
          return reviewCard.outerHTML;
        }).join('')}
      </div>
    </div>
  `;
  
  // Insert the older reviews section after the main endorsements section
  const endorsementsSection = document.getElementById('endorsements');
  endorsementsSection.parentNode.insertBefore(olderSection, endorsementsSection.nextSibling);
}

// Function to toggle older reviews visibility
function toggleOlderReviews() {
  const container = document.getElementById('older-reviews-container');
  const toggleIcon = document.getElementById('toggle-icon');
  const toggleText = document.getElementById('toggle-text');
  
  if (container.style.display === 'none') {
    container.style.display = 'block';
    toggleIcon.className = 'fas fa-chevron-up me-1';
    toggleText.textContent = 'Hide All';
  } else {
    container.style.display = 'none';
    toggleIcon.className = 'fas fa-chevron-down me-1';
    toggleText.textContent = 'Show All';
  }
}

// Function to create review card
function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'col-lg-4 col-md-6 mb-4';
  
  // Create star rating
  const rating = parseInt(review.rating) || 5;
  const stars = Array.from({length: 5}, (_, i) => 
    i < rating ? '<i class="fas fa-star text-warning"></i>' : '<i class="far fa-star text-warning"></i>'
  ).join('');
  
  // Format date
  const reviewDate = review.date ? new Date(review.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';
  
  // Get initials for avatar
  const initials = review.name ? review.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U';
  
  // Create avatar color based on name
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const colorIndex = review.name ? review.name.charCodeAt(0) % colors.length : 0;
  const avatarColor = colors[colorIndex];
  
  // LinkedIn link
  const linkedinLink = (review.linkedin && review.linkedin.startsWith('http')) ? `
    <a href="${review.linkedin}" class="ms-2" target="_blank" rel="noopener noreferrer" title="View LinkedIn Profile">
      <i class="fab fa-linkedin"></i>
    </a>
  ` : '';
  
  card.innerHTML = `
    <div class="card h-100 shadow-sm border-0 review-card">
      <div class="card-body p-4">
        <!-- Header with Avatar and Info -->
        <div class="d-flex align-items-center mb-3">
          <div class="review-avatar me-3" style="background: ${avatarColor};">
            <span class="avatar-text">${initials}</span>
          </div>
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold text-dark">${review.name || 'Anonymous'}${linkedinLink}</h6>
            <p class="mb-0 text-muted small">${review.role || 'Client'}</p>
            ${review.company && review.company !== 'N/A' ? `<p class="mb-0 text-muted small">${review.company}</p>` : ''}
          </div>
        </div>
        
        <!-- Rating Stars -->
        <div class="mb-3">
          <div class="d-flex align-items-center">
            <div class="me-2">
              ${stars}
            </div>
            <span class="text-muted small">${rating}/5</span>
          </div>
        </div>
        
        <!-- Review Text -->
        <div class="review-content mb-3">
          <p class="mb-0 text-dark" style="line-height: 1.6; font-size: 0.95rem;">
            "${review.review || 'Great work and excellent communication throughout the project!'}"
          </p>
        </div>
        
        <!-- Footer with Date -->
        <div class="review-footer">
          <small class="text-muted">
            <i class="fas fa-calendar-alt me-1"></i>
            ${reviewDate}
          </small>
        </div>
      </div>
      
      <!-- Decorative accent -->
      <div class="review-accent" style="background: ${avatarColor};"></div>
    </div>
  `;
  
  return card;
}

// ===== MAIN APPLICATION CODE =====
document.addEventListener('DOMContentLoaded', function() {
  
  // ===== CORE FUNCTIONALITY =====
  
  // Initialize Bootstrap ScrollSpy
  const dataSpyList = [].slice.call(document.querySelectorAll('[data-bs-spy="scroll"]'));
  dataSpyList.forEach(function (dataSpyEl) {
    bootstrap.ScrollSpy.getOrCreateInstance(dataSpyEl);
  });

  // ===== NAVIGATION =====
  
  // Mobile Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Close mobile menu when clicking on links
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.add('hidden');
    });
  });

  // ===== THEME TOGGLE =====
  
  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Toggle icons
    const icons = [
      document.getElementById('theme-icon'),
      document.getElementById('theme-icon-mobile')
    ];
    
    icons.forEach(icon => {
      if (icon) {
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
      }
    });
  }

  // Theme toggle event listeners
  document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(btn => {
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  // ===== SMOOTH SCROLLING =====
  
  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ===== COLLAPSE FUNCTIONALITY =====
  
  // Initialize all collapse elements
  function initializeCollapses() {
    document.querySelectorAll('.collapse').forEach(collapseEl => {
      try {
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
          new bootstrap.Collapse(collapseEl, { toggle: false });
        }
      } catch (error) {
        console.warn('Could not initialize collapse:', error);
      }
    });
  }

  // Handle collapse button text toggle
  function handleCollapseToggle(button, targetElement) {
    const collapsed = button.querySelector('.collapsed');
    const expanded = button.querySelector('.expanded');
    
    if (collapsed && expanded) {
      // Listen for Bootstrap collapse events
      targetElement.addEventListener('show.bs.collapse', function() {
        collapsed.classList.add('d-none');
        expanded.classList.remove('d-none');
      });
      
      targetElement.addEventListener('hide.bs.collapse', function() {
        collapsed.classList.remove('d-none');
        expanded.classList.add('d-none');
      });
      
      // Also handle manual toggle as fallback
      button.addEventListener('click', function(e) {
        // Prevent default only if Bootstrap is not handling it
        if (typeof bootstrap === 'undefined') {
          e.preventDefault();
          const isExpanded = targetElement.classList.contains('show');
          if (isExpanded) {
            targetElement.classList.remove('show');
            collapsed.classList.remove('d-none');
            expanded.classList.add('d-none');
          } else {
            targetElement.classList.add('show');
            collapsed.classList.add('d-none');
            expanded.classList.remove('d-none');
          }
        }
      });
    }
  }

  // Initialize collapse functionality with better error handling
  function initializeCollapseButtons() {
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(button => {
      const targetId = button.getAttribute('data-bs-target');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        console.log('Initializing collapse for:', targetId); // Debug log
        handleCollapseToggle(button, targetElement);
        
        // Ensure Bootstrap collapse is initialized
        if (typeof bootstrap !== 'undefined') {
          try {
            const collapseInstance = new bootstrap.Collapse(targetElement, { toggle: false });
            console.log('Bootstrap collapse initialized for:', targetId); // Debug log
          } catch (error) {
            console.error('Error initializing Bootstrap collapse for:', targetId, error);
          }
        }
      } else {
        console.error('Target element not found for:', targetId);
      }
    });
  }

  // Initialize all collapses
  initializeCollapses();
  initializeCollapseButtons();

  // Debug function to test collapse functionality
  function testCollapseFunctionality() {
    console.log('=== Testing Collapse Functionality ===');
    
    // Check if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined') {
      console.log('✅ Bootstrap is loaded');
    } else {
      console.error('❌ Bootstrap is not loaded');
    }
    
    // Check collapse elements
    const collapseElements = document.querySelectorAll('.collapse');
    console.log('Found collapse elements:', collapseElements.length);
    
    collapseElements.forEach((el, index) => {
      console.log(`Collapse ${index + 1}:`, el.id, 'Classes:', el.className);
    });
    
    // Check toggle buttons
    const toggleButtons = document.querySelectorAll('[data-bs-toggle="collapse"]');
    console.log('Found toggle buttons:', toggleButtons.length);
    
    toggleButtons.forEach((btn, index) => {
      const target = btn.getAttribute('data-bs-target');
      console.log(`Button ${index + 1}:`, target, 'Classes:', btn.className);
    });
  }

  // Run test after a short delay
  setTimeout(testCollapseFunctionality, 1000);

  // Additional fallback for project-specific collapses
  document.querySelectorAll('.project-toggle').forEach(button => {
    const targetId = button.getAttribute('data-bs-target');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // Ensure the collapse element has proper Bootstrap classes
      if (!targetElement.classList.contains('collapse')) {
        targetElement.classList.add('collapse');
      }
      
      // Initialize Bootstrap collapse if available
      if (typeof bootstrap !== 'undefined') {
        try {
          new bootstrap.Collapse(targetElement, { toggle: false });
        } catch (error) {
          console.warn('Could not initialize project collapse:', error);
        }
      }
    }
  });

  // Specific handling for Extracurricular Activities collapses
  document.querySelectorAll('#extracurricular [data-bs-toggle="collapse"]').forEach(button => {
    const targetId = button.getAttribute('data-bs-target');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      console.log('Initializing extracurricular collapse for:', targetId); // Debug log
      
      // Ensure the collapse element has proper Bootstrap classes
      if (!targetElement.classList.contains('collapse')) {
        targetElement.classList.add('collapse');
      }
      
      // Initialize Bootstrap collapse if available
      if (typeof bootstrap !== 'undefined') {
        try {
          const collapseInstance = new bootstrap.Collapse(targetElement, { toggle: false });
          console.log('Bootstrap collapse initialized for extracurricular:', targetId); // Debug log
        } catch (error) {
          console.error('Error initializing extracurricular collapse for:', targetId, error);
        }
      }
      
      // Add manual fallback if Bootstrap fails
      button.addEventListener('click', function(e) {
        // If Bootstrap is not handling it, do manual toggle
        if (typeof bootstrap === 'undefined') {
          e.preventDefault();
          const isExpanded = targetElement.classList.contains('show');
          const collapsed = button.querySelector('.collapsed');
          const expanded = button.querySelector('.expanded');
          
          if (isExpanded) {
            targetElement.classList.remove('show');
            if (collapsed && expanded) {
              collapsed.classList.remove('d-none');
              expanded.classList.add('d-none');
            }
          } else {
            targetElement.classList.add('show');
            if (collapsed && expanded) {
              collapsed.classList.add('d-none');
              expanded.classList.remove('d-none');
            }
          }
        }
      });
    } else {
      console.error('Target element not found for extracurricular:', targetId);
    }
  });

  // ===== REVIEW MANAGEMENT =====
  
  // Load reviews when page loads
  loadReviews();

  // ===== FORM HANDLING =====
  
  // Notification System
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Endorsement Form Handling
  const endorsementForm = document.getElementById('endorsement-form');
  if (endorsementForm) {
    endorsementForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Form validation
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
      submitBtn.disabled = true;

      try {
        const formData = {
          data: {
            name: this.name.value,
            role: this.role.value,
            company: this.company.value || 'N/A',
            linkedin: this.linkedin.value || '',
            review: this.review.value,
            rating: this.rating.value,
            date: new Date().toISOString()
          }
        };

        const response = await fetch(SHEETDB_REVIEW_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Thank you for your review! It will be displayed soon.', 'success');
          this.reset();
          this.classList.remove('was-validated');
          // Show the new review at the top immediately
          const newReview = formData.data;
          const reviewsContainer = document.querySelector('#endorsements .row.justify-content-center');
          if (reviewsContainer) {
            const reviewCard = createReviewCard(newReview);
            reviewsContainer.prepend(reviewCard);
          }
          // Refresh reviews after delay
          setTimeout(() => {
            loadReviews();
          }, 2000);
        } else {
          throw new Error('Failed to submit review');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Sorry, there was an error submitting your review. Please try again.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
      submitBtn.disabled = true;

      try {
        const formData = {
          data: {
            name: this.name.value,
            MobileNumber: this['Mobile Number'].value,
            email: this.email.value,
            message: this.message.value,
            date: new Date().toISOString()
          }
        };

        const response = await fetch(SHEETDB_CONTACT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
          this.reset();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ===== ANIMATIONS & EFFECTS =====
  
  // Add loading animation to project cards
  document.querySelectorAll('#projects .card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in-up');
  });

  // Add hover effects to skill progress bars
  document.querySelectorAll('.progress-bar').forEach(bar => {
    bar.addEventListener('mouseenter', function() {
      this.style.transition = 'width 0.5s ease';
    });
  });

  // ===== GSAP ANIMATIONS =====
  
  // Register the ScrollTrigger plugin
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate all sections (except hero) on scroll
    gsap.utils.toArray("section:not(#hero)").forEach(section => {
      gsap.from(section, {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%", // when section top hits 80% of viewport
          toggleActions: "play none none none"
        }
      });
    });
  }

  // ===== UTILITIES =====
  
  // Update copyright year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

});

// ===== NOTIFICATION STYLES =====
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
    animation: slideInRight 0.3s ease;
  }
  
  .notification-content {
    background: var(--card-bg);
    color: var(--text-color);
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-left: 4px solid var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .notification-success .notification-content {
    border-left-color: #28a745;
  }
  
  .notification-error .notification-content {
    border-left-color: #dc3545;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.25rem;
    margin-left: 0.5rem;
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .fade-in-up {
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
    transform: translateY(30px);
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 