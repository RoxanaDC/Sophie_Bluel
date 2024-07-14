// Ajout dynamique des travaux dans la galerie de portfolio de la page
// Récupération des travaux existants depuis l'API
document.addEventListener("DOMContentLoaded", async () => {
  let gallery = document.querySelector(".gallery");
  try {
    let response = await fetch("http://localhost:5678/api/works");
    let dataWorks = await response.json();
    let works = dataWorks;
    console.log(works);

    // Boucle sur chaque travail
    works.forEach((work) => {
      // Creation <figure>
      let figureSite = document.createElement("figure");
      figureSite.className = `work-item category-id-0 category-id-${work.categoryId}`;
      figureSite.id = `work-item-${work.id}`;

      // Creation <img>
      let imageSite = document.createElement("img");
      imageSite.src = work.imageUrl;
      imageSite.alt = work.title;

      // Creation <figcaption>
      let figCaptionSite = document.createElement("figcaption");
      figCaptionSite.textContent = work.title;

      //Append
      figureSite.appendChild(imageSite);
      figureSite.appendChild(figCaptionSite);
      gallery.appendChild(figureSite);

      console.log(work.title);
    });
  } catch (error) {
    console.error("fetch error:", error);
  }
});

// Ajout de filtres de catégories pour filtrer les travaux dans la galerie
// Récupération des catégories existantes depuis l'API
document.addEventListener("DOMContentLoaded", async () => {
  try {
    let response = await fetch("http://localhost:5678/api/categories");
    /*   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } */

    let dataCategories = await response.json();
    let categories = dataCategories;
    console.log(categories);

    /* Ajouter l'élément supplémentaire 'Tous', avec l'identifiant 0 
    au début du tableau catégories, obtenu depuis l'API.   */
    categories.unshift({ id: 0, name: "Tous" });

    // Boucle pour chaque catégorie
    categories.forEach((category) => {
      // Creation <button> pour filter
      let bouttonFilter = document.createElement("button");
      bouttonFilter.classList.add("work-filter");
      bouttonFilter.classList.add("filters-design");

      if (category.id === 0)
        bouttonFilter.classList.add("filter-active", "filter-all");
      bouttonFilter.setAttribute("data-filter", category.id);
      bouttonFilter.textContent = category.name;

      //Ajout du nouveau <button> dans le div.filters existant
      document.querySelector("div.filters").appendChild(bouttonFilter);

      // Click event <button> to filter
      bouttonFilter.addEventListener("click", function (event) {
        event.preventDefault();
        // Gestion des filtres
        document.querySelectorAll(".work-filter").forEach((workFilter) => {
          workFilter.classList.remove("filter-active");
        });
        event.target.classList.add("filter-active");

        //Gestion works
        let categoryId = bouttonFilter.getAttribute("data-filter");
        document.querySelectorAll(".work-item").forEach((workItem) => {
          workItem.style.display = "none";
        });
        document
          .querySelectorAll(`.work-item.category-id-${categoryId}`)
          .forEach((workItem) => {
            workItem.style.display = "block";
          });
      });
    });
  } catch (error) {
    console.error("fetch error:", error);
  }
});
