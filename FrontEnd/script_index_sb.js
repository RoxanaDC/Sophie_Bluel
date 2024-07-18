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

/* --- Quand connectée avec ---
--- user: sophie.bluel@test.tld ---
---password: S0phie --- */

// Click sur logout pour deconecter
//Si le bouton cliqué, le token et userID sont supprimés de localStorage
//l'interface est modifiée pour indiquer que l'utilisateur n'est plus connecté.
document
  //Selectioner l'element avec id="nav-logout".
  .getElementById("nav-logout")
  //Ajouter un listener pour l'evenement click:
  .addEventListener("click", function (event) {
    //Prevenir le comportement implicit
    event.preventDefault();
    //Efacer les données du localStorage:
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    //La modification visuelle de la page quand l'admin est connectée
    //(l'elimination de la classe connected de l'element <body>)
    document.querySelector("body").classList.remove(`connected`);
    //Selecter l'element avec id="top-bar" et mettre le style display à none,
    //pour le cacher
    let topBar = document.getElementById("top-bar");
    topBar.style.display = "none";
    //Selecter l'element avec id="all-filters" et mettre le syle display à flex,
    //pour l'afficher.
    let filters = document.getElementById("all-filters");
    filters.style.display = "flex";
    //Selecter l'element avec id="space-only-admin" et mettre le syle paddingBottom à 0,
    // pour modifier l'espace en bas de cet element
    let space = document.getElementById("space-only-admin");
    space.style.paddingBottom = "0";
  });

//Attacher l'evenement DOMContentLoaded au document pour s'assurer que les fonctions
// sont executées juste après que le document soit chargé et analisé totalement
document.addEventListener("DOMContentLoaded", function () {
  handleAdminMode();
  setupLogoutListener();
  setupUpdateWorksListener();
  setupModalCloseListeners();
  setupModalEditListeners();
  setupFormHandlers();
  fetchCategories();
  bindFormFieldsCheck();
});

//La fonction handleAdminMode, verifie s'il existe un token et un userId dans localStorage (utilisateur autentifié)

function handleAdminMode() {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("userId") != null
  ) {
    //Si token et useId existent, on modifie l'interface, pour aficher les elements d'administration
    document.querySelector("body").classList.add("connected");
    document.getElementById("top-bar").style.display = "flex";
    document.getElementById("all-filters").style.display = "none";
    document.getElementById("space-only-admin").style.paddingBottom = "100px";
    document.getElementById(
      "space-introduction-in-mode-admin"
    ).style.marginTop = "-50px";
  }
}

//Définit un écouteur pour le bouton de mise à jour du travail.
//Lorsque l'utilisateur clique sur ce bouton, les tâches de l'API sont récupérées et le modal est mis à jour.
function setupUpdateWorksListener() {
  document
    .getElementById("update-works")
    .addEventListener("click", function (event) {
      event.preventDefault();
      fetchWorksAndUpdateModal();
    });
}
//Requête à l'API pour récupérer les travaux existants.
//Si la réponse est ok, appelle la fonction updateWorksModal avec les données reçues.

function fetchWorksAndUpdateModal() {
  fetch("http://localhost:5678/api/works")
    .then((response) =>
      response.ok ? response.json() : Promise.reject(response)
    )
    .then((data) => updateWorksModal(data))
    .catch((err) => console.log(err));
}

//la fonction updateWorksModal reçoit une liste de travaux (works),
function updateWorksModal(works) {
  //Selectioner l'element dans lequel on va aficher les traveaux (works) - il a la classe .modal-content,
  //et il est l'enfant de l'element avec id-ul #modal-works et classe .modal-gallery dans le même temps
  const modalContent = document.querySelector(
    "#modal-works.modal-gallery .modal-content"
  );
  //Effacer le contenu de l'element modalContent
  modalContent.innerText = "";
  //pour chaque traveaux de l'array work
  works.forEach((work) => {
    //on fait appel a la fontion createWorkFigure(work)
    //qui reçoit un travaux en paramettre et returne un element HTML qui represente le travaux
    const workFigure = createWorkFigure(work);
    //Ajouter l'element workFigure (qui contienne la representation HTML du travaux)
    //à l'interieur de modalContent, pour etre affiché dans le modal.
    modalContent.appendChild(workFigure);
    //Appeler la fonction qui efface le travaux courrent
    setupTrashIconListener(work);
  });
  //appeler la fonction openWorkModal() qui va faire visible le modal
  openWorkModal();
}

//Construction et le retourn d'un element <figure>, qui va contenir toutes les infos sur le travaux
function createWorkFigure(work) {
  let myFigure = document.createElement("figure");
  myFigure.className = `work-item category-id-0 category-id-${work.categoryId}`;
  myFigure.id = `work-item-popup-${work.id}`;
  myFigure.appendChild(createImageElement(work));
  myFigure.appendChild(createTrashIcon());
  return myFigure;
}
// Creation de l'image
function createImageElement(work) {
  let myImg = document.createElement("img");
  myImg.src = work.imageUrl;
  myImg.alt = work.title;
  return myImg;
}

//Creation et configuration de l'element <i> - corbeille
function createTrashIcon() {
  let trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash-can", "trash");
  return trashIcon;
}

function setupTrashIconListener(work) {
  document
    .getElementById(`work-item-popup-${work.id}`)
    .querySelector(".trash")
    .addEventListener("click", function (event) {
      event.preventDefault();

      // Afficher une fênetre pour confirmer la supression
      if (confirm("Voulez-vous supprimer cet élément ?")) {
        //si confirmé, alors supprime le traveaux
        deleteWork(work.id);
      }
    });
}

// Fontion pour supprimer
function deleteWork(workId) {
  // Demande envoyé à l'API pour la supression
  fetch(`http://localhost:5678/api/works/${workId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"), // Le token est envoyé dans l'antete de l'autorisation
    },
  })
    .then((response) => handleDeleteResponse(response, workId))
    .catch((err) => console.log(err));
}

// Gestion de la reponse du serveur API
function handleDeleteResponse(response, workId) {
  switch (response.status) {
    case 500:
    case 503:
      alert("Comportement inattendu!");
      break;
    case 401:
      alert("Suppresion impossible!");
      break;
    case 200:
    case 204:
      document.getElementById(`work-item-${workId}`).remove();
      document.getElementById(`work-item-popup-${workId}`).remove();
      break;
    default:
      alert("Erreur inconnue!");
      break;
  }
}

// Visibilité du modal
function openWorkModal() {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-works").style.display = "block";
}

//Gestioner les fermetures des modales
function setupModalCloseListeners() {
  document.querySelectorAll("#modal-works").forEach((modalWorks) => {
    modalWorks.addEventListener("click", (event) => event.stopPropagation()); //pour eviter que la modale ferme quand on clik sur elle

    document.querySelectorAll("#modal-edit").forEach((modalEdit) => {
      modalEdit.addEventListener("click", (event) => event.stopPropagation());

      document.getElementById("modal").addEventListener("click", closeModal);
    });
  });

  document
    .getElementById("button-to-close-first-window")
    .addEventListener("click", closeModal);

  document
    .getElementById("button-to-close-second-window")
    .addEventListener("click", closeModalAndReset);
}

//Cacher la modale principale et les 2 sections: modal-works et modal-edit
function closeModal(event) {
  event.preventDefault();
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-works").style.display = "none";
  document.getElementById("modal-edit").style.display = "none";
}

// Fermer modal et reset
function closeModalAndReset(event) {
  closeModal(event);
  resetModalForm();
}
// Reset modal form
function resetModalForm() {
  // Si l'element avec id = "form-image-preview" existe, celui-ci est eliminé du DOM
  if (document.getElementById("form-image-preview")) {
    document.getElementById("form-image-preview").remove();
  }

  document.getElementById("modal-edit-work-form").reset();

  // Afficher l'icon gris avec le soleil et la montagnes
  document.getElementById("photo-add-icon").style.display = "block";

  // Afficher label id new-image
  document.getElementById("new-image").style.display = "block";

  // Afficher la balise <p> qui donne des infos sur la dimension du photo
  document.getElementById("photo-size").style.display = "block";

  // paddind pour la div qui contienne les 3 elements precedentes
  document.getElementById("modal-edit-new-photo").style.padding =
    "30px 0 19px 0";

  // Schimbă culoarea de fundal a butonului de submit pentru a indica că nu este activat
  document.getElementById("submit-new-work").style.backgroundColor = "grey";
}

// Naviguer entre les 2 sections de la modale - la section avec la liste les travaux et la section pour editer la liste +
// Reset le formulaire pour editer
function setupModalEditListeners() {
  // Configurer le bouton "modal-edit-add" de la liste des travaux
  document
    .getElementById("modal-edit-add")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("modal-works").style.display = "none";
      document.getElementById("modal-edit").style.display = "block";
    });
  // Configurer le bouton "arrow-return"
  document
    .getElementById("arrow-return")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("modal-works").style.display = "block";
      document.getElementById("modal-edit").style.display = "none";
      resetModalForm();
    });
}
// Demande à L'API les categories et les passer à la fonction populateCategories pour remplir la liste
function fetchCategories() {
  fetch("http://localhost:5678/api/categories")
    .then((response) =>
      response.ok ? response.json() : Promise.reject(response)
    )
    .then((data) => populateCategories(data))
    .catch((err) => console.log(err));
}

// Creation d'une liste d'options dropdown avec les categories obtenues precedement
function populateCategories(categories) {
  categories.forEach((category) => {
    let myOption = document.createElement("option");
    myOption.value = category.id;
    myOption.textContent = category.name;
    //Ajouter les options obtenues, dans l'element <select> qui a la classe = "choice-category"
    document.querySelector("select.choice-category").appendChild(myOption);
  });
}

//Gestion de l'evenement SUBMIT envoyé par le bouton "Valider" du formulaire d'ajoute de photo
function setupFormHandlers() {
  document
    .getElementById("modal-edit-work-form")
    .addEventListener("submit", function (event) {
      //Prevent default et appele fonction submitNewWork()
      event.preventDefault();
      submitNewWork();
    });
  //Selecter l'element de type <input> avec id= "form-image"
  document
    .getElementById("form-image")
    .addEventListener("change", handleImagePreview);
}

function submitNewWork() {
  // Creer un nouveau objet formData, pour collecter les données du formulaire
  let formData = new FormData();
  formData.append("title", document.getElementById("form-title").value);
  formData.append("category", document.getElementById("form-category").value);
  formData.append("image", document.getElementById("form-image").files[0]);

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: formData,
  })
    .then((response) => handleNewWorkResponse(response)) // Gestioner la reponse de la demande
    .then((json) => addNewWorkToPage(json)) // Appelle une function qui ajoute le travaux à la page
    .catch((err) => console.log(err));
}

//Gestion de la reponse de l'API, après l'envoye d'un nouveaux travaux
function handleNewWorkResponse(response) {
  switch (response.status) {
    case 500:
    case 503:
      alert("Erreur inattendue!");
      break;
    case 400:
    case 404:
      alert("Impossible d'ajouter le nouveau projet!");
      break;
    case 200:
    case 201:
      return response.json();
    default:
      alert("Erreur inconnue!");
      break;
  }
}
// Ajouter un nouveaux travaux dans la gallerie
//Fermer et reset la modale d'ajoute
function addNewWorkToPage(json) {
  let myFigure = createWorkFigure(json);
  document.querySelector("div.gallery").appendChild(myFigure);
  closeModalAndReset();
}

// Gestion de l'image - est ce qu'elle respecte la dimension ?
function handleImagePreview() {
  let fileInput = document.getElementById("form-image");
  const maxFileSize = 4 * 1024 * 1024; // 4 MB
  //S'il existe au moins un fichier de type image selecté
  if (fileInput.files.length > 0) {
    // le fichier est stoqué dans la constante "file"
    const file = fileInput.files[0];
    if (file.size > maxFileSize) {
      alert("La taille du fichier dépasse 4 MB.");
      // La fonction s'arrete si l'image est trop grande
      return;
    }

    let reader = new FileReader();
    // Fonction anonyme pour l'evenement onload du FileReader.
    // Si le fichier est lu avec succes, on appele cette fonction et on lui donne un evenement "e".

    reader.onload = function (e) {
      // l'appel de la fonction updateImagePreview avec le résultat de la lecture du fichier (e.target.result),
      updateImagePreview(e.target.result);
    };
    //Se inițiază citirea fișierului selectat ca un URL de date (data URL).
    //Acest lucru va declanșa evenimentul onload definit anterior, odată ce citirea este completă.
    reader.readAsDataURL(file);
  }
}
//funtia updateImagePreview, creează sau actualizează un element de imagine pentru a previzualiza o nouă fotografie încărcată,
//ascunde anumite elemente de pe pagină și ajustează stilul containerului
//pentru a se potrivi cu noua previzualizare.
function updateImagePreview(imageSrc) {
  //Se încearcă să se obțină elementul de previzualizare a imaginii cu ID-ul form-image-preview.
  let imgPreview =
    document.getElementById("form-image-preview") ||
    //Dacă acest element nu există, se creează un nou element <img>.
    document.createElement("img");
  //Se setează diferite atribute ale elementului imgPreview.
  imgPreview.id = "form-image-preview";
  //Se setează sursa imaginii (src) la URL-ul imaginii (imageSrc),
  //care a fost furnizat ca parametru al funcției.
  imgPreview.src = imageSrc;
  imgPreview.alt = "Prévisualisation de la nouvelle photo";
  imgPreview.style.width = "129px";
  imgPreview.style.height = "168px";
  // cover - imaginea va acoperi complet elementul, păstrând în același timp raportul de aspect.
  imgPreview.style.objectFit = "cover";
  // daca elementul cu id = form-image-preview NU EXISTA,
  if (!document.getElementById("form-image-preview")) {
    //Se obține elementul div care conține formularul de editare a noii fotografii, identificat prin ID-ul modal-edit-new-photo.
    let formDiv = document.getElementById("modal-edit-new-photo");
    //Se adaugă elementul imgPreview, la începutul elementului div cu id = modal-edit-new-photo
    formDiv.prepend(imgPreview);
  }
  //Se ascund elementele cu id-urile: photo-add-icon, new-image si photo-size
  document.getElementById("photo-add-icon").style.display = "none";
  document.getElementById("new-image").style.display = "none";
  document.getElementById("photo-size").style.display = "none";

  document.getElementById("modal-edit-new-photo").style.padding = "0";
}

//În esență, funcția bindFormFieldsCheck() face următoarele:
//Selectează toate elementele de input și select dintr-un formular specific.
//Adaugă un ascultător de evenimente pentru fiecare dintre aceste elemente.
//Asigură că de fiecare dată când utilizatorul modifică valoarea unui câmp,
//se declanșează funcția validateFormFields, care validează datele din formular.
//Această funcție este utilă pentru a implementa o validare dinamică și
//interactivă a formularului, permițându-i utilizatorului să primească feedback instantaneu despre datele introduse.
function bindFormFieldsCheck() {
  //selectează toate elementele <input> și <select>
  //din cadrul formularului formularul cu ID-ul modal-edit-work-form și
  //le returnează sub forma unei liste NodeList.
  let formFields = document.querySelectorAll(
    "#modal-edit-work-form input, #modal-edit-work-form select"
  );
  //Se iterează prin fiecare element din lista formFields folosind metoda forEach.
  formFields.forEach((field) => {
    //Pentru fiecare element de input și select, se adaugă un eveniment de ascultare (event listener) pentru evenimentul input.
    //Evenimentul input se declanșează de fiecare dată când valoarea unui câmp de input sau select se schimbă.
    //Funcția validateFormFields este apelată de fiecare dată când evenimentul input este declanșat,
    //permițând validarea în timp real a câmpurilor formularului.
    field.addEventListener("input", validateFormFields);
  });
}
//Funcția validateFormFields() validează câmpurile unui formular pentru a verifica dacă toate sunt completate
//și modifică stilul butonului de trimitere în funcție de această validare
function validateFormFields() {
  //selectează toate elementele <input> și <select> din cadrul formularului cu id = modal-edit-work-form
  //și le returnează sub forma unei liste NodeList.
  let formFields = document.querySelectorAll(
    "#modal-edit-work-form input, #modal-edit-work-form select"
  );
  //Se inițializează o variabilă allFieldsFilled cu valoarea true.
  //Această variabilă va fi folosită pentru a determina dacă toate câmpurile formularului sunt completate.
  let allFieldsFilled = true;
  //Se iterează prin fiecare element din lista formFields folosind metoda forEach.
  formFields.forEach((field) => {
    //Pentru fiecare câmp, se verifică dacă valoarea acestuia este goală.
    //(după eliminarea spațiilor de la început și sfârșit cu trim())
    //Dacă un câmp este gol, se setează allFieldsFilled la false.
    if (!field.value.trim()) {
      allFieldsFilled = false;
    }
  });
  //Se obține elementul butonului de trimitere a formularului cu ID-ul submit-new-work.
  //Se setează culoarea de fundal a butonului în funcție de valoarea allFieldsFilled:
  //Dacă allFieldsFilled este true (toate câmpurile sunt completate), culoarea de fundal este setată la #1D6154 (o nuanță de verde).
  //Dacă allFieldsFilled este false (cel puțin un câmp nu este completat), culoarea de fundal este setată la #A7A7A7 (gri).
  document.getElementById("submit-new-work").style.backgroundColor =
    allFieldsFilled ? "#1D6154" : "#A7A7A7";
}
