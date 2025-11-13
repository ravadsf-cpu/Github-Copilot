import React, { useEffect, useRef } from 'react';

/**
 * TiltEmbed mounts the Tilt debate widget in auto-generation mode.
 * Auto mode: omit debate id; the script will create or reuse a debate based on page context.
 *
 * Props:
 * - apiKey: required Tilt project API key (safe for client embed)
 * - theme: optional theme name (e.g., 'midnight')
 * - className: optional wrapper classes
 */
const TiltEmbed = ({ apiKey, theme = 'midnight', className = '' }) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (!apiKey) return;

    // Ensure our container has the attributes some versions of the embed look for
    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.setAttribute('data-project-key', apiKey);
      containerEl.classList.add('tilt-debate');
    }

    // If a prior embed script exists that matches, don't add duplicates; let it mount into our container
    const existing = Array.from(document.querySelectorAll('script'))
      .find(s => s.src && s.src.includes('data.tilt.vote/tilt-embed.js'));

    let createdScript = null;
    const attachScript = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://data.tilt.vote/tilt-embed.js';
      script.setAttribute('data-api-key', apiKey);
      if (theme) script.setAttribute('data-theme', theme);
      // Keep references for cleanup
      scriptRef.current = script;
      createdScript = script;
      // Insert right after container for locality
      const parent = containerEl?.parentElement || document.body;
      parent.appendChild(script);
    };

    if (!existing) {
      attachScript();
    } else {
      // Re-run mount by cloning the script with our attributes to ensure correct config
      attachScript();
    }

    return () => {
      // Clean up: remove our script tag (do not remove global ones we didn't create)
      if (createdScript && createdScript.parentNode) {
        createdScript.parentNode.removeChild(createdScript);
      }
      // Also clear the container contents to unmount widget UI
      if (containerEl) {
        containerEl.innerHTML = '';
      }
    };
  }, [apiKey, theme]);

  return (
    <div className={className}>
      {/* Support both selector styles: id and class */}
      <div id="tilt-root" ref={containerRef} />
    </div>
  );
};

export default TiltEmbed;
