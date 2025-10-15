function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}

function activeInbox() {
  // get all list items inside the 2nd nav-section (Inbox)
  let items = document.querySelectorAll(
    ".sidebar-content > :nth-child(2) > .nav-list > *"
  );

  items.forEach((item) => {
    // console.log(item.querySelector(".nav-link").classList);
    item.addEventListener("click", function () {
      // remove active from all items first
      items.forEach((el) =>
        el.querySelector(".nav-link").classList.remove("active")
      );

      this.querySelector(".nav-link").classList.add("active");
    });
  });
}
activeInbox();

function Category() {
  let items = document.querySelectorAll(
    ".sidebar-content > :nth-child(3) > .nav-list > *"
  );

  items.forEach((item) => {
    item.addEventListener("click", function () {
      let button = item.querySelector(".nav-link");

      if (button.classList.contains("active")) {
        button.classList.remove("active");
      } else {
        button.classList.add("active");
      }

      console.log(button.classList);
    });
  });
}
Category();
