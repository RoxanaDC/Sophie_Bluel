document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("user-login-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      // Collecte des données du formulaire
      const user = {
        email: document.querySelector("#email").value,
        password: document.querySelector("#password").value,
      };
      console.log(user);
      // Envoi une requête pour s'authentifier
      fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })
        .then(function (response) {
          switch (response.status) {
            case 200:
              console.log("Connecté");
              return response.json();
              break;

            case 404:
              alert("Utilisateur non trouvé");
              break;
            case 401:
              alert("Utilisateur pas autorisé");
              break;

            default:
              alert("Erreur server");
              break;
          }
        })
        .then(function (data) {
          console.log(data);
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          // Redirection vers 'index.html'
          location.href = "index.html";
        })

        .catch(function (err) {
          console.log(err);
        });
    });
});
console.log("test");
