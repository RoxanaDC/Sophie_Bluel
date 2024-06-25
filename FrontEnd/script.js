document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");

  async function fetchWorks() {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const data = await response.json();

      data.forEach((element) => {
        console.log(element.title);
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = element.imageUrl;
        img.alt = element.title;

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = element.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
      });
    } catch (error) {
      console.error("Eroare la fetch:", error);
    }
  }

  fetchWorks();
});
