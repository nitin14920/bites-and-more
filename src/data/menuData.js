const menuData = [
  // ── LEMONADES ──
  { id: 1,  name: "Pinky Picky Poo",             category: "lemonades", tags: ["lemonades","beverages","veg"], price: "₹85",  emoji: "🍋", desc: "A playful pink lemonade with a burst of fruity flavors.",                                           veg: true  },
  { id: 2,  name: "Masala Lemonade",              category: "lemonades", tags: ["lemonades","beverages","veg"], price: "₹85",  emoji: "🌶️", desc: "Classic lemonade spiced with chaat masala and black salt.",                                          veg: true  },
  { id: 3,  name: "Ice Spicy",                    category: "lemonades", tags: ["lemonades","beverages","veg"], price: "₹85",  emoji: "❄️", desc: "Icy cool lemonade with a spicy kick at the end.",                                                    veg: true  },

  // ── MOCKTAILS ──
  { id: 4,  name: "Ayurvedic Mojito",             category: "mocktails", tags: ["mocktails","beverages","veg"], price: "₹120", emoji: "🌿", desc: "Herb-infused mojito with tulsi, mint and lemon — a wellness sip.",                                    veg: true  },
  { id: 5,  name: "Fire & Ice",                   category: "mocktails", tags: ["mocktails","beverages","veg"], price: "₹110", emoji: "🔥", desc: "A dramatic contrast of fiery ginger and icy coolness.",                                               veg: true,  badge: "Popular"      },
  { id: 6,  name: "Bloody Orange",                category: "mocktails", tags: ["mocktails","beverages","veg"], price: "₹120", emoji: "🍊", desc: "Freshly squeezed blood orange with sparkling water and grenadine.",                                    veg: true  },
  { id: 7,  name: "Blue Mojito",                  category: "mocktails", tags: ["mocktails","beverages","veg"], price: "₹110", emoji: "💙", desc: "A striking blue butterfly pea flower mojito with lime.",                                               veg: true  },
  { id: 8,  name: "Strawberry Blast",             category: "mocktails", tags: ["mocktails","beverages","veg"], price: "₹110", emoji: "🍓", desc: "Fresh strawberries blended with basil and sparkling water.",                                           veg: true  },

  // ── SHAKES ──
  { id: 9,  name: "Red Velvet Chocolate Shake",   category: "shakes",    tags: ["shakes","beverages","veg"],    price: "₹160", emoji: "🎂", desc: "Indulgent red velvet flavored shake with rich chocolate undertones.",                                  veg: true,  badge: "Chef's Pick"  },
  { id: 10, name: "Salted Caramel Shake",         category: "shakes",    tags: ["shakes","beverages","veg"],    price: "₹180", emoji: "🍬", desc: "Premium salted caramel shake with whipped cream topping.",                                             veg: true  },
  { id: 11, name: "Monkey Business",              category: "shakes",    tags: ["shakes","beverages","veg"],    price: "₹160", emoji: "🍌", desc: "Banana and peanut butter shake — wildly delicious.",                                                   veg: true  },
  { id: 12, name: "Cookie Shake",                 category: "shakes",    tags: ["shakes","beverages","veg"],    price: "₹160", emoji: "🍪", desc: "Oreo cookie blended with vanilla ice cream and milk.",                                                 veg: true  },

  // ── BEVERAGES ──
  { id: 13, name: "Irish Cappuccino",             category: "beverages", tags: ["beverages","veg"],             price: "₹145", emoji: "☕", desc: "Velvety cappuccino with a hint of Irish flavor and steamed milk foam.",                                veg: true  },
  { id: 14, name: "Hazelnut Mocha",               category: "beverages", tags: ["beverages","veg"],             price: "₹180", emoji: "☕", desc: "Rich espresso with hazelnut syrup and dark chocolate swirls.",                                         veg: true,  badge: "Popular"      },
  { id: 15, name: "Affogato",                     category: "beverages", tags: ["beverages","veg"],             price: "₹185", emoji: "🍨", desc: "Vanilla ice cream drowned in hot espresso — the Italian classic.",                                     veg: true  },
  { id: 16, name: "Caramel Frappe",               category: "beverages", tags: ["beverages","veg"],             price: "₹195", emoji: "🥤", desc: "Blended iced coffee with sweet caramel and whipped cream.",                                            veg: true  },

  // ── PIZZA ──
  { id: 17, name: "Pizza Margherita (9\")",       category: "pizza",     tags: ["pizza","veg"],                 price: "₹325", emoji: "🍕", desc: "San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.",                          veg: true  },
  { id: 18, name: "Tandoori Paneer Pizza (9\")",  category: "pizza",     tags: ["pizza","veg"],                 price: "₹380", emoji: "🍕", desc: "Paneer tikka, tomatoes, onion, and capsicum on a tandoori base.",                                      veg: true,  badge: "Bestseller"   },
  { id: 19, name: "Peri Peri Chicken Pizza (9\")",category: "pizza",     tags: ["pizza","non-veg"],             price: "₹450", emoji: "🍕", desc: "Spicy peri peri marinated chicken on a crispy pizza base.",                                            veg: false, badge: "Spicy 🌶️"     },
  { id: 20, name: "Chicken Seekh Pizza (9\")",    category: "pizza",     tags: ["pizza","non-veg"],             price: "₹450", emoji: "🍕", desc: "Roasted chicken seekh kabab with tomatoes, onion, and capsicum.",                                      veg: false },

  // ── PASTA ──
  { id: 21, name: "Mac n Cheese",                 category: "pasta",     tags: ["pasta","veg"],                 price: "₹280", emoji: "🧀", desc: "Classic creamy mac and cheese with a golden breadcrumb crust.",                                        veg: true  },
  { id: 22, name: "Alfredo Penne Pasta",          category: "pasta",     tags: ["pasta","veg"],                 price: "₹280", emoji: "🍝", desc: "Penne in rich Alfredo cream sauce with herbs and parmesan.",                                           veg: true,  badge: "Popular"      },
  { id: 23, name: "Arrabiata Penne Pasta",        category: "pasta",     tags: ["pasta","veg"],                 price: "₹280", emoji: "🌶️", desc: "Spicy arrabiata tomato sauce tossed with perfectly cooked penne.",                                     veg: true  },
  { id: 24, name: "Lasagna Pasta Veg",            category: "pasta",     tags: ["pasta","veg"],                 price: "₹380", emoji: "🍝", desc: "Layered pasta sheets with béchamel, marinara, and grilled vegetables.",                               veg: true  },

  // ── CHINESE ──
  { id: 25, name: "Chilli Chicken Gravy",         category: "chinese",   tags: ["chinese","non-veg"],           price: "₹330", emoji: "🥢", desc: "Tender chicken in a fiery chilli and soy sauce gravy with bell peppers.",                             veg: false, badge: "Bestseller"   },
  { id: 26, name: "Kung Pao Chicken Gravy",       category: "chinese",   tags: ["chinese","non-veg"],           price: "₹425", emoji: "🥢", desc: "Classic Chinese Kung Pao with chicken, peanuts, and dried chilies.",                                  veg: false },
  { id: 27, name: "Chilli Paneer Gravy",          category: "chinese",   tags: ["chinese","veg"],               price: "₹330", emoji: "🥢", desc: "Crispy paneer tossed in a spicy Chinese sauce with peppers and onions.",                              veg: true,  badge: "Popular"      },
  { id: 28, name: "Exotic Veggies in Butter Garlic Sauce", category: "chinese", tags: ["chinese","veg"],        price: "₹350", emoji: "🥦", desc: "Seasonal exotic vegetables in a rich butter garlic Chinese sauce.",                                   veg: true  },
  { id: 29, name: "Hakka Noodles",                category: "chinese",   tags: ["chinese","veg"],               price: "₹180", emoji: "🍜", desc: "Stir-fried noodles with vegetables in a light soy-ginger sauce.",                                     veg: true  },
  { id: 30, name: "Schezwan Fried Rice",          category: "chinese",   tags: ["chinese","veg"],               price: "₹220", emoji: "🍚", desc: "Wok-fried rice with schezwan sauce, vegetables, and egg.",                                            veg: true  },

  // ── THAI ──
  { id: 31, name: "Veg Thai Red Curry with Rice", category: "thai",      tags: ["thai","veg"],                  price: "₹365", emoji: "🥘", desc: "Authentic Thai red curry with coconut milk, Thai basil, and seasonal veggies.",                       veg: true,  badge: "Chef's Pick"  },
  { id: 32, name: "Chicken Thai Green Curry with Rice", category: "thai",tags: ["thai","non-veg"],              price: "₹395", emoji: "🥘", desc: "Fragrant green curry with tender chicken in coconut milk broth.",                                     veg: false },
  { id: 33, name: "Pad Thai Noodles",             category: "thai",      tags: ["thai","veg"],                  price: "₹280", emoji: "🍜", desc: "Wok-fried rice noodles with tofu, sprouts, peanuts, and tamarind.",                                   veg: true  },
  { id: 34, name: "Prawns Thai Red Curry with Rice", category: "thai",   tags: ["thai","non-veg"],              price: "₹650", emoji: "🦐", desc: "Tiger prawns simmered in a bold Thai red curry with steamed jasmine rice.",                           veg: false },

  // ── DESSERTS ──
  { id: 35, name: "Sizzling Brownie",             category: "desserts",  tags: ["desserts","veg"],              price: "₹210", emoji: "🍫", desc: "Warm chocolate brownie on a sizzler plate with vanilla ice cream.",                                   veg: true,  badge: "Must Try"     },
  { id: 36, name: "Fantasy Fudge Delight",        category: "desserts",  tags: ["desserts","veg"],              price: "₹210", emoji: "🍮", desc: "Decadent chocolate fudge layered dessert with crushed cookies.",                                      veg: true  },
  { id: 37, name: "Nutty Brownie Delight",        category: "desserts",  tags: ["desserts","veg"],              price: "₹210", emoji: "🥜", desc: "Classic brownie loaded with mixed nuts and a drizzle of caramel.",                                    veg: true  },
  { id: 38, name: "Chocolate Doughnut",           category: "desserts",  tags: ["desserts","veg"],              price: "₹90",  emoji: "🍩", desc: "Freshly glazed doughnut with rich chocolate coating.",                                               veg: true  },
];

export default menuData;
