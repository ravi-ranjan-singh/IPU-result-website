const redirectToResult = function(e) {
  e.preventDefault();
  const enrollmentNo = document.querySelector("input").value;
  const select = document.querySelector("select");
  let semester;
  if (select) semester = select.value;
  let url;
  semester
    ? (url = `/${enrollmentNo}/${semester.split(" ")[1]}`)
    : (url = `/${enrollmentNo}/`);
  window.location = url;
};

document
  .querySelector(".submit-roll")
  .addEventListener("click", e => redirectToResult(e));

document.addEventListener("keypress", e => {
  if (e.keyCode === 13) redirectToResult(e);
});

window.onload = function() {
  if (document.querySelectorAll("tr").length == 1) {
    let url = document.querySelector(".next-page").href;
    let page = parseInt(document.querySelector(".current").textContent);
    if (page > 9) {
      url = `${url.substr(0, url.length - 2)}${page - 1}`;
    } else {
      url = `${url.substr(0, url.length - 1)}${page - 1}`;
    }

    window.location.href = url;
  }
};
