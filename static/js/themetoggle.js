function setTheme(mode) {
    localStorage.setItem("theme-storage", mode);
    var toggleIcon = document.querySelector("#dark-mode-toggle > .feather > use");
    var darkStyle = document.getElementById("darkModeStyle");
    if (mode === "dark") {
        if (darkStyle) darkStyle.disabled = false;
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        if (toggleIcon) toggleIcon.href.baseVal = toggleIcon.href.baseVal.replace(/#.*$/, "#sun");
    } else if (mode === "light") {
        if (darkStyle) darkStyle.disabled = true;
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
        if (toggleIcon) toggleIcon.href.baseVal = toggleIcon.href.baseVal.replace(/#.*$/, "#moon");
    }
    // Dispara reset do Disqus se o embed já estiver carregado
    if (typeof window.__resetDisqusColorScheme === "function") {
        window.__resetDisqusColorScheme();
    }
}

function toggleTheme() {
    if (localStorage.getItem("theme-storage") === "light") {
        setTheme("dark");
    } else if (localStorage.getItem("theme-storage") === "dark") {
        setTheme("light");
    }
}

// Init: usa valor salvo, senão respeita preferência do OS
var savedTheme = localStorage.getItem("theme-storage");
if (!savedTheme) {
    savedTheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
}
setTheme(savedTheme);
