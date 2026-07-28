document.querySelectorAll('.main-nav a').forEach(link => {
  if (link.href === window.location.href) {
    link.style.color = '#ff79c8';
    link.style.borderBottomColor = '#db007d';
  }
});
