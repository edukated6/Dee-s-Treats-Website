require('dotenv').config()
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

const app = express()

// Enable CORS for GitHub Pages and Vercel deployments
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://edukated6.github.io',
    'https://dee-s-treats-website-git-main-edukated6s-projects.vercel.app'
  ]
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Remove static file serving - frontend will be on GitHub Pages
// app.use(express.static('../'))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.send('Stripe Checkout API is running!')
})

// To avoid "Cannot GET /checkout" on direct GET access
app.get('/checkout', (req, res) => {
    res.status(405).send('Use POST /checkout from the cart form (redirect to Stripe checkout).')
})

app.post('/checkout', async (req, res) => {
    try {
        console.log('Checkout request received')
        console.log('Request body:', req.body)

        const cart = JSON.parse(req.body.cart || '[]')
        console.log('Cart received:', cart)

        if (cart.length === 0) {
            console.log('Cart is empty, returning error')
            return res.status(400).send('Cart is empty')
        }

        const line_items = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [`https://raw.githubusercontent.com/edukated6/Dee-s-Treats-Website/main/${item.image}`]
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }))

        console.log('Line items:', line_items)

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['US']
            },
            success_url: `https://dee-s-treats-website-git-main-edukated6s-projects.vercel.app/complete?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://dee-s-treats-website-git-main-edukated6s-projects.vercel.app/cancel`
        })

        console.log('Stripe session created:', session.id)
        console.log('Redirecting to:', session.url)

        res.redirect(session.url)
    } catch (error) {
        console.error('Checkout error:', error)
        res.status(400).send('Error processing checkout: ' + error.message)
    }
})

app.get('/complete', async (req, res) => {
    const result = Promise.all([stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
    stripe.checkout.sessions.listLineItems(req.query.session_id)
])

    console.log(JSON.stringify(await result))

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Complete | Dee's Treats</title>
        <link rel="icon" type="image/png" href="https://edukated6.github.io/Dee-s-Treats-Website/svgs/dee%20treats%20logo.svg">
        <link rel="stylesheet" href="https://edukated6.github.io/Dee-s-Treats-Website/css/cartstyle.css">
      </head>
      <body>
        <div class="main-hero-nav">
          <a href="https://edukated6.github.io/Dee-s-Treats-Website/index.html"><img class="logo" src="https://edukated6.github.io/Dee-s-Treats-Website/pngs/Dee's%20Treats%20Logo%202026.png" alt="dee's treats logo" height="100" width="220"></a>
          <ul class="nav-list">
            <li><a href="https://edukated6.github.io/Dee-s-Treats-Website/index.html#Treats">Treats</a></li>
            <li><a href="https://edukated6.github.io/Dee-s-Treats-Website/index.html#review">Reviews</a></li>
            <li><a href="https://edukated6.github.io/Dee-s-Treats-Website/contact.html">Contact</a></li>
          </ul>
          <a href="https://edukated6.github.io/Dee-s-Treats-Website/cart.html" class="cart-icon-wrapper"><img class="shopping-cart" src="https://edukated6.github.io/Dee-s-Treats-Website/svgs/shopping%20cart.svg" alt="Shopping Icon" height="35" width="35"><span id="cart-count" class="cart-count">0</span></a>
        </div>

        <main>
          <section class="cart-section" style="padding-top:180px; text-align:center;">
            <h2 class="cart-title">Thank You!</h2>
            <p style="font-size:1.8rem; color:#fff; filter: drop-shadow(1px 1px 1px black);">Your payment was successful and your order is confirmed.</p>
            <p style="font-size:1.2rem; color:#fff; margin-bottom:30px;">Your cart has been emptied so you can start a new order.</p>
            <a href="https://edukated6.github.io/Dee-s-Treats-Website/index.html" class="checkout-btn" style="display:inline-block; margin-top:20px;">Continue Shopping</a>
          </section>
        </main>

        <footer class="footer" style="text-align:center; padding:20px; color:white; background:rgba(0,0,0,0.2);">
          <p class="copyright">©2026 Dee's Treat · All Rights Reserved</p>
        </footer>

        <script>
          try {
            localStorage.removeItem('cart');
            const cartCount = document.getElementById('cart-count');
            if (cartCount) cartCount.textContent = '0';
          } catch (error) {
            console.warn('Could not clear cart in browser:', error);
          }
        </script>
      </body>
      </html>
    `)
})

app.get('/cancel', (req, res) => {
    res.redirect('https://edukated6.github.io/Dee-s-Treats-Website/cart.html')
})

// Export for Vercel serverless functions
module.exports = app

// Only listen when running locally (not on Vercel)
if (require.main === module) {
    app.listen(3000, () => console.log('Server started on port 3000'))
}