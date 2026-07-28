const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle?.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

document.querySelectorAll(".faq button").forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const symbol = button.querySelector("span");
    const opened = answer.classList.toggle("open");
    symbol.textContent = opened ? "−" : "+";
  });
});
