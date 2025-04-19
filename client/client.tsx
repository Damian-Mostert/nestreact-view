import React from 'react';
import ReactDOM from 'react-dom/client';
document.querySelectorAll('script[nestclient]').forEach((script) => {
	try {
		const json = JSON.parse(script.getAttribute('nestclient') || '{}');
		const { body, props = {}, type = 'div', id } = json;
		if (!id || !body) return;
		const Component = new Function('React', `return (${body})`)(React);
		const Wrapper = () => React.createElement(React.Fragment, null, Component(props));
		const target = document.getElementById(id);
		if (target) {
			const root = ReactDOM.createRoot(target);
        root.render(Wrapper());
		}
		script.remove();
	} catch (e) {
		console.error('Failed to render nestclient component:', e);
	}
});
