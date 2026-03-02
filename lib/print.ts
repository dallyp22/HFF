/**
 * Force-finish all Web Animations API animations (used by framer-motion v12+)
 * so that all content is fully visible, then trigger the browser print dialog.
 */
export function printPage() {
  // Finish all WAAPI animations — this forces opacity:1, transform:none etc.
  document.getAnimations().forEach((anim) => anim.finish())

  // Give the browser a frame to apply the finished animation states
  requestAnimationFrame(() => {
    window.print()
  })
}
