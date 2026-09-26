# Ojasv Issar · portfolio

The portfolio of a data scientist and AI/ML engineer, designed as a national park trail guide.
Live at **[ojasvissar.tech](https://ojasvissar.tech)**.

- **Hero:** four painted parallax layers, with code notes on the peaks
- **About:** a field credential card
- **Services:** a trailhead signpost, where each board opens a route card showing the stages of the work
- **Projects:** a field diary you flip through, one spread per project
- **Client reviews:** a summit register
- **Work experience:** a survey map whose trail draws itself; click a stop for detailed field notes
- **Toolkit:** a tree-ring cross-section of the stack
- **Education:** two base camps, Pune and Vancouver
- **Contact:** a postcard, with a booking calendar alongside it
- **Résumé:** `resume.html` shows the PDF on a contour map, with open and download buttons
- **Footer:** a trail map linking back to every section
- **Morning and night modes:** follow the visitor's local time, or the switch in the menu bar

Plain HTML, CSS and JavaScript with no build step. The paintings and photos are WebP; the maps, charts and other scenery are drawn in code.

```
index.html   page content
resume.html  résumé viewer
style.css    all styles, including the night palette
script.js    interactions and generated scenery
assets/      paintings, photos, logos and bird sprites (WebP/SVG)
```

To run it locally, serve the folder with any static server, for example `python3 -m http.server`.
