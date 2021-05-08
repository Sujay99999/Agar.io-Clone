// This page is the only page js file loaded, when the url is loaded
// This js file is not a module. Hence, we can directly expose the file without the module bundling

//  After loading the UI, depending the mode of authentication asked, redirect tot he respective url
console.log("initStuff loaded");

// Other modules
import axios from "axios";
import "core-js/stable";
import "regenerator-runtime/runtime";

// DOM elements
const basicForm = document.getElementById("login-form-basic");
const anonymousForm = document.getElementById("login-form-anonymous");
const googleBtn = document.getElementById("login-btn-google");
//const basicFormBtn = document.getElementById("login-form-basic-button");
const anonymousFormBtn = document.getElementById("login-form-anonymous-button");
//const basicFormEmail = document.getElementById("login-form-basic-email");
//const basicFormPassword = document.getElementById("login-form-basic-password");
const anonymousFormName = document.getElementById("login-form-anonymous-name");

// auth using google
// 1) directly hit the google route
googleBtn.addEventListener("click", (event) => {
  window.location.assign("/auth/google");
});

// auth using form
// 1) Get the details from the form and redirect to the game page
// basicForm.addEventListener("submit", async (event) => {
//   event.preventDefault();

//   const email = basicFormEmail.value;
//   const password = basicFormPassword.value;
//   const response = await axios({
//     method: "post",
//     url: "/game",
//     data: {
//       email: email,
//       password: password,
//     },
//   });
// });

// auth anonymously
// 1) Get the name form the form. and and hit the /login-anonymous

anonymousForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = anonymousFormName.value;
  console.log(name);

  window.location.assign(`${location.href}game?name=${name}`);
});
