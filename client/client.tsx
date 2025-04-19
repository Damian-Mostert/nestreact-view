import React from 'react';
import ReactDOM from 'react-dom/client';

function waitForNestClientScripts(callback) {
  const check = () => {
    const scripts = document.querySelectorAll('script[nestclient]');
    if (scripts.length === 0) {
      requestAnimationFrame(check);
    } else {
      callback(scripts);
    }
  };
  requestAnimationFrame(check);
}

waitForNestClientScripts((scripts) => {
  scripts.forEach((script) => {
    try {
      const json = JSON.parse(script.getAttribute('nestclient') || '{}');
      const { body, props = {}, id, modules } = json;
      if (!id || !body) return;

      const Component = new Function(`React,${modules}`, `return (${body})`)(React,{{MODULES}});
      const Wrapper = () => React.createElement(React.Fragment, null, Component(props));
      const target = document.getElementById(id);

      if (target) {
        const root = ReactDOM.createRoot(target);
        root.render(Wrapper());
      }

      script.remove();
    } catch (e) {
      console.error('❌ Failed to render nestclient component:', e);
    }
  });
});
