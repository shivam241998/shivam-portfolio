// Custom JS for Portfolio

document.addEventListener('DOMContentLoaded', function() {
  // Bootstrap ScrollSpy
  var dataSpyList = [].slice.call(document.querySelectorAll('[data-bs-spy="scroll"]'));
  dataSpyList.forEach(function (dataSpyEl) {
    bootstrap.ScrollSpy.getOrCreateInstance(dataSpyEl);
  });

  // Back to Top smooth scroll
  document.querySelectorAll('a[href="#hero"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    });
  });
}); 