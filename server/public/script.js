const header = document.querySelector("header");
const popular = document.querySelector(".observe-popular");
let cartArr = [];

const persistCartArr = function (data) {
  localStorage.setItem("cartArr", JSON.stringify(data));
};
const persistCartCount = function (data) {
  localStorage.setItem("cartCount", JSON.stringify(data));
};
//SMOOTH SCROLLING FROM NAV AND FOOTER TO SECTIONS
document.querySelectorAll(".nav__link").forEach(function (el) {
  el.addEventListener("click", function (e) {
    e.preventDefault();
    const id = this.getAttribute("href");
    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
  });
});
//STICKY NAV using intersection observer API
if (header) {
  const nav = document.querySelector(".nav");
  const navheight = nav.getBoundingClientRect().height;
  const navitem = document.querySelectorAll(".nav-item");
  const navObserverCallBack = function (entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        nav.classList.add("sticky");
        navitem.forEach((el) => (el.style.backgroundColor = "transparent"));
      } else {
        nav.classList.remove("sticky");
        navitem.forEach((el) => (el.style.backgroundColor = "white"));
      }
    });
  };
  const navObserverOptions = {
    root: null,
    threshold: 0,
    rootMargin: `-${navheight}px`,
  };
  const navObserver = new IntersectionObserver(
    navObserverCallBack,
    navObserverOptions
  );
  navObserver.observe(header);
}

//STICKY MENU SIDEBAR using intersection observer API
if (popular) {
  const sideBar = document.querySelector(".sidebar");
  const popularheight = popular.getBoundingClientRect().height;

  const observerCallBack = function (entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        sideBar.classList.add("sticky-side-bar");
      } else {
        sideBar.classList.remove("sticky-side-bar");
      }
    });
  };
  const observerOptions = {
    root: null,
    threshold: 0,
    rootMargin: `-${popularheight}px`,
  };
  const observer = new IntersectionObserver(observerCallBack, observerOptions);
  observer.observe(popular);
}

//CART CHANGING NUMBER AFTER MENU BUTTON CLICKED
//SELECT MENU PRICING BTNS
const menuBtn = document.querySelectorAll(".menu-btn");
const root = document.querySelector(":root"); //grabbing the root element
let cartCount = 0;
//MENU BTN EVENT LISTENER
menuBtn.forEach((el) => {
  el.addEventListener("click", function () {
    //MAKE NUMBER AT CART GO UP AS USER CLICKS ON CART
    cartCount++;
    root.style.setProperty("--pseudo-text", `"${cartCount}"`);
    persistCartCount(cartCount);
    //PUSH NEW ELEMENT TO STRIPE CART BY ...
    //FINDING ITEM'S ID
    const id = Number(el.closest("li").dataset.set);
    //AND SEEING IF IT IS NOT ALREADY PART OF THE CART
    const isRepeat = cartArr.find((el) => el.id === id);
    if (isRepeat) {
      //IF IT IS A REPEAT, ADD TO THE REPEAT QUANTITY ONLY
      isRepeat.quantity++;
      persistCartArr(cartArr);
    } else {
      //IF IT IS NOT A REPEAT MAKE QUANTITY ONE
      cartArr.push({ id: Number(id), quantity: 1 });
      persistCartArr(cartArr);
    }
  });
});

const checkoutButton = document.querySelector(".menu-cart");
if (checkoutButton)
  checkoutButton.addEventListener("click", () => {
    fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartArr,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        window.location = url;
      })
      .catch((e) => {
        console.error(e.error);
      });
  });
