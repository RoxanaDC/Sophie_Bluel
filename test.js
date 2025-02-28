// click sur le boutton "modifier"
function clickSurModifier() {
  let modifierLink = document.getElementById("update-works");
  if (modifierLink) {
    modifierLink.addEventListener("click", function (eveniment) {
      eveniment.preventDefault();
      console.log("ai apasat pe link");
    });
  } else {
    console.error("elementul update-work nu a fost gasit");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  clickSurModifier();
});
