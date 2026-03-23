const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const emptyCart = document.getElementById("empty-cart");


function getCart(){
return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart){
localStorage.setItem("cart", JSON.stringify(cart));
}


function renderCart(){

let cart = getCart();

cartItemsContainer.innerHTML = "";

if(cart.length === 0){
emptyCart.style.display = "block";
cartTotal.innerText = "$0.00";
return;
}

emptyCart.style.display = "none";

let total = 0;

cart.forEach((item,index)=>{

total += item.price * item.quantity;

const li = document.createElement("li");
li.classList.add("cart-item");

li.innerHTML = `

<img class="java-images" src="${item.image}" width="400">

<div class="cart-item-info">

<h3>${item.name}</h3>
<p>$${item.price}</p>

<div class="quantity-controls">

<button onclick="decreaseQty(${index})">-</button>
<span>${item.quantity}</span>
<button onclick="increaseQty(${index})">+</button>

</div>

<button class="remove-btn" onclick="removeItem(${index})">Remove</button>

</div>
`;

cartItemsContainer.appendChild(li);

});

cartTotal.innerText = "$" + total.toFixed(2);

const cartDataInput = document.getElementById("cart-data");
if(cartDataInput){
cartDataInput.value = JSON.stringify(cart);
}

}



function increaseQty(index){

let cart = getCart();

cart[index].quantity++;

saveCart(cart);

renderCart();

updateCartCount();

}



function decreaseQty(index){

let cart = getCart();

if(cart[index].quantity > 1){
cart[index].quantity--;
}else{
cart.splice(index,1);
}

saveCart(cart);

renderCart();

updateCartCount();

}



function removeItem(index){

let cart = getCart();

cart.splice(index,1);

saveCart(cart);

renderCart();

updateCartCount();

}


document.addEventListener("DOMContentLoaded", renderCart);

/*Button Funtions*/
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