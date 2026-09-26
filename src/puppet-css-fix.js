const style = document.createElement('style');
style.textContent = `
@keyframes sHead {
  0%,100% {
    transform: translate(var(--pose-x), calc(var(--pose-y) + 8px)) rotate(calc(var(--pose-r) + var(--expr-r)));
  }
  50% {
    transform: translate(var(--pose-x), calc(var(--pose-y) + 10px)) rotate(calc(var(--pose-r) + var(--expr-r) + 1deg));
  }
}
`;
document.head.appendChild(style);
