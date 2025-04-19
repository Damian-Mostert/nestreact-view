import React from 'react';
import ReactDOM from 'react-dom/client';
document.querySelectorAll('script[nestclient]').forEach((script) => {
	try {
		const json = JSON.parse(script.getAttribute('nestclient') || '{}');
		const { body, props = {}, id, modules } = json;
		if (!id || !body) return;
		const Component = new Function(modules, `return (${body})`)(...eval(modules));
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
