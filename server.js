// Simple Express.js server with /checkout POST route
const cors = require('cors');
const app = express();
app.use(cors());
//const PORT = 5000;
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/checkout', (req, res) => {
  // You can add validation or save to DB here
  console.log('Received checkout data:', req.body);
  res.json({ success: true, message: 'Checkout data received.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
