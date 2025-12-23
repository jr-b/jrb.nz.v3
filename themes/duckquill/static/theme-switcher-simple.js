// Theme Initialization - runs immediately to prevent flash
(function () {
	const storedTheme = localStorage.getItem('theme');
	const defaultTheme = document.documentElement.getAttribute('data-theme');

	if (storedTheme && storedTheme !== 'system') {
		document.documentElement.setAttribute('data-theme', storedTheme);
	} else if (defaultTheme && storedTheme !== 'system') {
		document.documentElement.setAttribute('data-theme', defaultTheme);
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
})();

// Simple rotating theme switcher
(function () {
	const themes = ['light', 'dark', 'system'];

	function getCurrentTheme() {
		const stored = localStorage.getItem('theme');
		if (stored && stored !== 'system') {
			return stored;
		}
		const defaultTheme = document.documentElement.getAttribute('data-theme');
		return defaultTheme || 'system';
	}

	function setTheme(theme) {
		if (theme === 'system') {
			document.documentElement.removeAttribute('data-theme');
			localStorage.removeItem('theme');
		} else {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
		}
		updateVisibleButton(theme);
	}

	function updateVisibleButton(currentTheme) {
		const buttons = {
			light: document.getElementById('theme-light'),
			dark: document.getElementById('theme-dark'),
			system: document.getElementById('theme-system')
		};

		// Hide all buttons
		Object.values(buttons).forEach(btn => {
			if (btn) btn.style.display = 'none';
		});
		// Show the current theme button
		if (buttons[currentTheme]) {
			buttons[currentTheme].style.display = 'inline-block';
		}
	}

	function getNextTheme(currentTheme) {
		const currentIndex = themes.indexOf(currentTheme);
		const nextIndex = (currentIndex + 1) % themes.length;
		return themes[nextIndex];
	}

	// Wait for DOM to be ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	function init() {
		const buttons = {
			light: document.getElementById('theme-light'),
			dark: document.getElementById('theme-dark'),
			system: document.getElementById('theme-system')
		};

		// Set up click handlers
		Object.entries(buttons).forEach(([theme, button]) => {
			if (button) {
				button.addEventListener('click', function() {
					const nextTheme = getNextTheme(theme);
					setTheme(nextTheme);
				});
			}
		});

		// Initialize visible button
		const currentTheme = getCurrentTheme();
		updateVisibleButton(currentTheme);
	}
})();
