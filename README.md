# Ojasv Issar · portfolio

A data science portfolio designed as a national park trail guide.
Live at **[ojasvissar.github.io/og](https://ojasvissar.github.io/og/)**.

- **Hero:** four painted parallax layers, with the name tucked behind the peaks
- **Projects as parks:** each project is a "park" with a gallery of screens
- **Experience:** a survey map whose trail draws itself; click a stop for detailed field notes
- **Education:** two base camps, Pune and Vancouver
- **Toolkit:** a tree-ring cross-section of the stack
- **Morning and night modes:** follow the visitor's local time, or the switch in the menu bar

Plain HTML, CSS and JavaScript with no build step and no dependencies.
Everything apart from the hero paintings is drawn in code.

```
index.html   page content
style.css    all styles, including the night palette
script.js    interactions and generated scenery
assets/      hero painting layers and bird sprites (WebP)
```

To run it locally, serve the folder with any static server, for example `python3 -m http.server`.
