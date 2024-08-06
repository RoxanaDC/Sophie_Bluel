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
   --- user and password: --- */
document.addEventListener("DOMContentLoaded", function () {
  handleAdminMode(); //verifie s'il existe un token et un userId dans localStorage (utilisateur autentifié)
  clickOnLinkModifier(); // click sur le lien "modifier"
  setupModalCloseListeners(); //Gestioner les fermetures des modales
  setupModalEditListeners(); // Naviguer entre les 2 sections de la modale + Reset le formulaire pour editer
  fetchCategories(); // Demande à L'API les categories et les passer à la fonction populateCategories pour remplir la liste
  setupFormHandlers(); //Gestion de l'evenement SUBMIT envoyé par le bouton "Valider" du formulaire d'ajoute de photo
  validateFormFields(); //Verifier si touts les champs sont remplis, pour ajouter une photo
  bindFormFieldsCheck(); //select toutes les elements du formulair. Si changement => appel la fonction de validation
  ListenSubmitModalEdit();
  //deleteWithNewBin();
});

// LOGIN
//modifie l'interface, pour aficher les elements d'administration
function handleAdminMode() {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("userId") != null
  ) {
    document.querySelector("body").classList.add("connected");
    document.getElementById("top-bar").style.display = "flex";
    document.getElementById("all-filters").style.display = "none";
    document.getElementById("space-only-admin").style.paddingBottom = "25px";
  }
}

// LOGOUT
//Efacer les données du localStorage:
//La modification visuelle de la page quand l'admin est connectée
document
  .getElementById("nav-logout")
  .addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    document.querySelector("body").classList.remove(`connected`);
    let topBar = document.getElementById("top-bar");
    topBar.style.display = "none";
    let filters = document.getElementById("all-filters");
    filters.style.display = "flex";
    let space = document.getElementById("space-only-admin");
    space.style.paddingBottom = "0";
  });

// click sur le lien "modifier"
function clickOnLinkModifier() {
  let lienPourModifier = document.getElementById("update-works");
  if (lienPourModifier) {
    lienPourModifier.addEventListener("click", function (eveniment) {
      eveniment.preventDefault();
      console.log(
        "tu as appuyé sur le lien pour modifier et tu vois la modale"
      );
      document.getElementById("modal").style.display = "flex";
      document.getElementById("modal-works").style.display = "block";
    });
  } else {
    console.error("l`element update-works est introuvable");
  }
  fetchWorksAndUpdateModal();
}

//Requête à l'API pour récupérer les travaux existants.
//Si la réponse est ok, appelle la fonction updateWorksModal avec les données reçues.
async function fetchWorksAndUpdateModal() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    updateWorksModal(data);
  } catch (err) {
    console.log(err);
  }
}

//In modal- Construction et le retourn d'un element <figure>, qui va contenir toutes les infos sur le travaux
function createWorkFigureInModal(work) {
  let myFigure = document.createElement("figure");
  myFigure.className = `work-item category-id-0 category-id-${work.categoryId}`;
  myFigure.id = `work-item-popup-${work.id}`;
  myFigure.appendChild(createImageElement(work));
  myFigure.appendChild(createTrashIcon(work));
  return myFigure;
}

//la fonction updateWorksModal reçoit la liste de travaux (works)
//selecter l'enfant .modal-content, de l'element avec id = #modal-works et classe = .modal-gallery
//Effacer le contenu de l'element modalContent
//Appel la fontion createWorkFigure(work) qui returne un element HTML qui represente le travaux
//Appeler la fonction setupTrashIconListener(), qui efface le travaux courrent
//appeler la fonction openWorkModal() qui va faire visible le modal

function updateWorksModal(works) {
  let modalContent = document.querySelector(
    "#modal-works.modal-gallery .modal-content"
  );
  modalContent.innerText = "";
  works.forEach((work) => {
    let workFigure = createWorkFigureInModal(work);
    modalContent.appendChild(workFigure);
    setupTrashIconListener(work);
  });
  openWorkModal();
}

//In page - Construction et le retourn d'un element <figure>, qui va contenir toutes les infos sur le travaux
function createWorkFigureInPage(work) {
  let myFigure = document.createElement("figure");
  myFigure.className = `work-item category-id-0 category-id-${work.categoryId}`;
  myFigure.id = `work-item-popup-${work.id}`;
  myFigure.appendChild(createImageElement(work));

  // Creation <figcaption>
  let figCaptionSite = document.createElement("figcaption");
  figCaptionSite.textContent = work.title;

  //Append
  myFigure.appendChild(figCaptionSite);

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
  trashIcon.classList.add(
    "fa-solid",
    "fa-trash-can",
    "trash",
    "nouvelle-corbeille"
  );

  return trashIcon;
}

// ------------------------ RRRRRRRR ---------------------------------

//attribuer a la nouvelle corbeille la possibilite de supprimer
//function deleteWithNewBin() {
//  let nouvelleCorbeille = document.querySelector("nouvelle-corbeille");
//  setupTrashIconListener(nouvelleCorbeille);
//}
// ------------------------ RRRRRRRR ---------------------------------

// Afficher une fênetre pour confirmer la supression. Si confirmé, alors supprime le traveaux
function setupTrashIconListener(work) {
  let trashIcon = document
    .getElementById(`work-item-popup-${work.id}`)
    .querySelector(".trash");
  if (trashIcon) {
    trashIcon.addEventListener("click", async function (event) {
      event.preventDefault();
      if (confirm("Voulez-vous supprimer cet élément ?")) {
        await deleteWork(work.id);
      }
    });
  }
}
// Fontion pour supprimer
// Demande envoyé à l'API pour la supression
// Le token est envoyé dans l'antete de l'autorisation
async function deleteWork(workId) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (response.ok) {
      document.getElementById(`work-item-${workId}`)?.remove();
      document.getElementById(`work-item-popup-${workId}`)?.remove();
      await fetchWorksAndUpdateModal(); // Reîncarcă lucrările după ștergere
    } else {
      handleDeleteResponse(response, workId);
    }
  } catch (err) {
    console.log(err);
  }
}

// Gestion de la reponse du serveur API pour
function handleDeleteResponse(response, workId) {
  switch (response.status) {
    case 500: //  Unexpected Behaviour
    case 503: // Service Unavailable
      alert("Comportement inattendu!");
      break;
    case 401: //Unauthorized
      alert("Suppresion impossible!");
      break;
    case 200: // Item Deleted
    case 204: // No Content
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
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-works").style.display = "none";
  document.getElementById("modal-works").style.cssText = `
  
  position:fixe;
  display: none;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: space-around;
  
 
`;
  document.querySelector(".modal-content").style.cssText = `
  margin-left:40px;
  margin-right:40px;
  width: auto;
  padding: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
grid-column-gap: 10px;
overflow: hidden;
  `;
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
// Si l'element avec id = "form-image-preview" existe, celui-ci est eliminé du DOM
// Afficher l'icon gris avec le soleil et la montagnes
// Afficher label id new-image
// Afficher la balise <p> qui donne des infos sur la dimension du photo
// Paddind pour la div qui contienne les 3 elements precedentes
// Changer la couleur du boutton valider pour indiquer qu'il n'est pas active
function resetModalForm() {
  if (document.getElementById("form-image-preview")) {
    document.getElementById("form-image-preview").remove();
  }
  document.getElementById("modal-edit-work-form").reset();
  document.getElementById("photo-add-icon").style.display = "block";
  document.getElementById("new-image").style.display = "block";
  document.getElementById("photo-size").style.display = "block";
  document.getElementById("modal-edit-new-photo").style.padding =
    "30px 0 19px 0";
  document.getElementById("submit-new-work").style.backgroundColor = "grey";
}

// Naviguer entre les 2 sections de la modale + Reset le formulaire pour editer
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
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    populateCategories(data);
  } catch (error) {
    console.log(error);
  }
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
/* function setupFormHandlers() {
  document
    .getElementById("form-image")
    .addEventListener("change", handleImagePreview);
} */

function setupFormHandlers() {
  document
    .getElementById("form-image")
    .addEventListener("change", function (event) {
      event.preventDefault(); // Prevenirea refresh-ului paginii
      handleImagePreview();
    });
}

async function submitNewWork() {
  // Creer un nouveau objet formData, pour collecter les données du formulaire
  let formData = new FormData();
  formData.append("title", document.getElementById("form-title").value);
  formData.append("category", document.getElementById("form-category").value);
  formData.append("image", document.getElementById("form-image").files[0]);

  try {
    let response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    });

    await handleNewWorkResponse(response); // Gestioner la reponse de la demande

    if (response.ok) {
      let json = await response.json();
      addNewWorkToPage(json);
      addNewWorkToModale(json);
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.log(err);
  }
}

//Gestion de la reponse de l'API, après l'envoye d'un nouveaux travaux
function handleNewWorkResponse(response) {
  switch (response.status) {
    case 500: //Unexpected Error
      alert("Erreur inattendue!");
      break;
    case 401: //Unauthorized
      alert("Pas authorisé!");
      break;
    case 400: //Bad Request
      alert("Impossible d'ajouter le projet!");
      break;
    case 201: //Created
      // return response.json();
      return response;
    default:
      alert("Erreur inconnue!");
      break;
  }
}

// Ajouter un nouveaux travaux dans la gallerie
//Fermer et reset la modale d'ajoute
function addNewWorkToPage(json) {
  let myFigure = createWorkFigureInPage(json);
  document.querySelector("div.gallery").appendChild(myFigure);
  closeModalAndReset();
}

// Ajouter un nouveaux travaux dans la modale

function addNewWorkToModale(json) {
  let myFigure = createWorkFigureInModal(json);
  document
    .querySelector("#modal-works.modal-gallery .modal-content")
    .appendChild(myFigure);
  setupTrashIconListener(json);
  closeModalAndReset();
}
// Gestion de l'image - est ce qu'elle respecte la dimension ?
//S'il existe au moins un fichier de type image selecté
// le fichier est stoqué dans la variable "file"
// La fonction s'arrete si l'image est trop grande
// Fonction anonyme pour l'evenement onload du FileReader.
// Si le fichier est lu avec succes, on appele cette fonction et on lui donne un evenement "e".
function handleImagePreview() {
  let fileInput = document.getElementById("form-image");
  const maxFileSize = 4 * 1024 * 1024; // 4 MB
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    if (file.size > maxFileSize) {
      alert("La taille du fichier dépasse 4 MB.");
      return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
      updateImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

//previsualiser une nouvelle photo, cacher des elements et modifier le style du container
//essaye d'obtenir l'element de previsualisation de l'image avec id=form-image-preview
//si l'element n'existe pas, il est creé avec ses characteristiques: id, src, etc...
//IF - si l'element avec id = form-image-preview n'existe pas, l'element imgPreview est ajouté au debout de l'element
//avec id = modal-edit-new-photo (celui avec l'icon soleil+montagne + bouton "+Ajouter photo" + dimension image)
function updateImagePreview(imageSrc) {
  let imgPreview =
    document.getElementById("form-image-preview") ||
    document.createElement("img");
  imgPreview.id = "form-image-preview";
  imgPreview.src = imageSrc;
  imgPreview.alt = "Prévisualisation de la nouvelle photo";
  imgPreview.style.width = "129px";
  imgPreview.style.height = "168px";
  imgPreview.style.objectFit = "cover";
  if (!document.getElementById("form-image-preview")) {
    let formDiv = document.getElementById("modal-edit-new-photo");
    formDiv.prepend(imgPreview);
  }
  document.getElementById("photo-add-icon").style.display = "none";
  document.getElementById("new-image").style.display = "none";
  document.getElementById("photo-size").style.display = "none";

  document.getElementById("modal-edit-new-photo").style.padding = "0";
}

//select toutes les elements du formulair. Si changement => appel la fonction de validation
function bindFormFieldsCheck() {
  let formFields = document.querySelectorAll(
    "#modal-edit-work-form input, #modal-edit-work-form select"
  );
  formFields.forEach((field) => {
    field.addEventListener("input", validateFormFields);
  });
}

//Initialisation à true, d'une variable - allFieldsFilled
//Verifier si la valeur de chaque element de la liste formFields est vide
//(trim elimine les espaces du debout et de la fin)
//Si un element est vide, la valeur de la variable allFieldsFilled est atribuée a false
//Le boutton "Valider" avec id = submit-new-work change de couleur en fonction de la valeur de la variable allFieldsFilled
//si allFieldsFilled est true - couleur verte
//allFieldsFilled est false - couleur grise
//après apuyer sur le bouton valider, la modale ferme
function validateFormFields() {
  let formFields = document.querySelectorAll(
    //"#modal-edit-work-form button, #modal-edit-work-form select, #modal-edit-work-form input"
    "#modal-edit-work-form select, #modal-edit-work-form input"
  );

  let allFieldsFilled = true;
  formFields.forEach((field) => {
    if (!field.value.trim()) {
      allFieldsFilled = false;
    }
  });
  document.getElementById("submit-new-work").style.backgroundColor =
    allFieldsFilled ? "#1D6154" : "#A7A7A7";

  /*   document
    .getElementById("submit-new-work")
    .addEventListener("click", submitNewWork); */

  /*   document
    .getElementById("modal-edit-work-form")
    .addEventListener("submit", function (event) {
      //event.preventDefault(); // Prevenirea refresh-ului paginii
      submitNewWork();
    }); */
}

function ListenSubmitModalEdit() {
  document
    .getElementById("modal-edit-work-form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevenirea refresh-ului paginii
      submitNewWork();
    });
}
