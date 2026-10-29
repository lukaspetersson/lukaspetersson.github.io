(() => {
  const practice = document.querySelector("[data-rotation-practice]");
  if (!practice || !window.FallingRotation) return;
  const kitten = practice.querySelector(".rotation-kitten");
  const status = practice.querySelector("[data-orientation]");
  const turn = practice.querySelector("[data-turn]");
  const another = practice.querySelector("[data-another]");
  const messages = [
    "Paws point down — upright.",
    "Paws point left. Turn the kitten upright.",
    "Paws point up. Turn the kitten upright.",
    "Paws point right. Turn the kitten upright.",
  ];
  let angle = 1;
  let startingAngle = 1;
  function render() {
    kitten.style.transform = `rotate(${angle * 90}deg)`;
    status.textContent = messages[angle];
    turn.setAttribute("aria-label", "Turn the kitten a quarter turn");
  }
  turn.addEventListener("click", () => {
    angle = FallingRotation.nextOrientation(angle);
    render();
  });
  another.addEventListener("click", () => {
    startingAngle = FallingRotation.nextStartingAngle(startingAngle);
    angle = startingAngle;
    render();
  });
  render();
  practice.hidden = false;
})();
