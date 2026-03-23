const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

// select all links inside the off screen menu
const menuLinks = document.querySelectorAll(".off-screen-menu a");


hamMenu.addEventListener("click", () => {
  offScreenMenu.classList.toggle("active");
});

// close menu when any link is clicked
menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        offScreenMenu.classList.remove("active");
    });
});

/*Button Function*/
function addToCart(name, price, image){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const existing = cart.find(item => item.name === name);

if(existing){
existing.quantity++;}
else{
cart.push({
name,
price,
image,
quantity:1
});
}
localStorage.setItem("cart", JSON.stringify(cart));

function showToast(){

const toast = document.getElementById("cart-toast");

toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},2000);
}
showToast();
updateCartCount();
renderDrawer();
}
/*Cart Icon Counter Bubble*/
function updateCartCount(){

const cart = JSON.parse(localStorage.getItem("cart")) || [];

let count = 0;

cart.forEach(item=>{
count += item.quantity;
});

const bubble = document.getElementById("cart-count");

if(bubble){
bubble.textContent = count;}
}

updateCartCount();
/*ends*/

function showToast(){

const toast = document.getElementById("cart-toast");

toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},2000);

}