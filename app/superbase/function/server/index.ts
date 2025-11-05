import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.jsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify user authentication
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No authorization token provided', user: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Invalid or expired token', user: null };
  }
  
  return { error: null, user };
}

// User Registration
app.post('/make-server-4ca6791f/auth/register', async (c) => {
  try {
    const { email, password, name, phone } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Registration error:', error);
      
      // Handle specific error cases with user-friendly messages
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return c.json({ 
          error: 'This email is already registered. Please login instead or use a different email.' 
        }, 400);
      }
      
      if (error.message.includes('password')) {
        return c.json({ 
          error: 'Password must be at least 6 characters long.' 
        }, 400);
      }
      
      return c.json({ 
        error: 'Registration failed. Please check your details and try again.' 
      }, 400);
    }
    
    // Store additional user profile data
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      name,
      phone,
      email,
      created_at: new Date().toISOString()
    });
    
    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        phone
      }
    });
  } catch (error) {
    console.log('Registration error:', error);
    return c.json({ error: 'Registration failed. Please try again.' }, 500);
  }
});

// Get user profile
app.get('/make-server-4ca6791f/auth/profile', async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const profile = await kv.get(`user_profile:${auth.user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to get profile: ' + error.message }, 500);
  }
});

// Get locations
app.get('/make-server-4ca6791f/locations', async (c) => {
  try {
    const locations = await kv.get('locations') || [
      { name: 'Nikol', shops: 45, popular: true },
      { name: 'CG Road', shops: 32, popular: true },
      { name: 'Bapunagar', shops: 28, popular: false },
      { name: 'Shukan', shops: 41, popular: true },
      { name: 'Chandkheda', shops: 19, popular: false },
      { name: 'Ghatlodia', shops: 37, popular: true },
      { name: 'Bopal', shops: 55, popular: true },
      { name: 'Vastrapur', shops: 42, popular: true },
      { name: 'Satellite', shops: 38, popular: true },
      { name: 'Maninagar', shops: 33, popular: false },
      { name: 'Naranpura', shops: 29, popular: false },
      { name: 'Gurukul', shops: 25, popular: false }
    ];
    
    // Initialize locations in storage if not exists
    if (!(await kv.get('locations'))) {
      await kv.set('locations', locations);
    }
    
    return c.json({ locations });
  } catch (error) {
    console.log('Get locations error:', error);
    return c.json({ error: 'Failed to get locations: ' + error.message }, 500);
  }
});

// Get shops by location
app.get('/make-server-4ca6791f/shops/:location', async (c) => {
  try {
    const location = c.req.param('location');
    let shops = await kv.get(`shops:${location}`);
    
    if (!shops) {
      // Initialize with sample shops
      shops = [
        {
          id: '1',
          name: 'Fresh Mart Grocery',
          category: 'Grocery & Essentials',
          rating: 4.5,
          deliveryTime: '20-30 mins',
          distance: '0.8 km',
          image: 'grocery store fresh',
          isOpen: true,
          featured: true,
          location
        },
        {
          id: '2',
          name: 'Spice Junction',
          category: 'Spices & Condiments',
          rating: 4.7,
          deliveryTime: '15-25 mins',
          distance: '1.2 km',
          image: 'spice market colorful',
          isOpen: true,
          featured: false,
          location
        },
        {
          id: '3',
          name: 'Tech World Electronics',
          category: 'Electronics',
          rating: 4.3,
          deliveryTime: '30-45 mins',
          distance: '1.5 km',
          image: 'electronics store modern',
          isOpen: true,
          featured: true,
          location
        },
        {
          id: '4',
          name: 'Style Studio Fashion',
          category: 'Clothing & Fashion',
          rating: 4.6,
          deliveryTime: '25-35 mins',
          distance: '0.6 km',
          image: 'fashion boutique clothing',
          isOpen: false,
          featured: false,
          location
        },
        {
          id: '5',
          name: 'Pharma Plus',
          category: 'Pharmacy & Health',
          rating: 4.8,
          deliveryTime: '10-20 mins',
          distance: '0.4 km',
          image: 'pharmacy medical store',
          isOpen: true,
          featured: true,
          location
        },
        {
          id: '6',
          name: 'Home Essentials',
          category: 'Home & Garden',
          rating: 4.2,
          deliveryTime: '35-50 mins',
          distance: '2.1 km',
          image: 'home goods store',
          isOpen: true,
          featured: false,
          location
        }
      ];
      
      await kv.set(`shops:${location}`, shops);
    }
    
    return c.json({ shops });
  } catch (error) {
    console.log('Get shops error:', error);
    return c.json({ error: 'Failed to get shops: ' + error.message }, 500);
  }
});

// Get products by shop
app.get('/make-server-4ca6791f/products/:shopId', async (c) => {
  try {
    const shopId = c.req.param('shopId');
    let products = await kv.get(`products:${shopId}`);
    
    if (!products) {
      // Initialize with sample products
      products = [
        {
          id: '1',
          name: 'Fresh Basmati Rice',
          price: 159,
          originalPrice: 199,
          description: 'Premium quality basmati rice, 1kg pack. Perfect for biryanis and pulao.',
          image: 'basmati rice grains',
          category: 'Grains & Cereals',
          inStock: true,
          rating: 4.5,
          discount: 20,
          shopId
        },
        {
          id: '2',
          name: 'Organic Vegetables Mix',
          price: 89,
          description: 'Fresh mixed vegetables including tomatoes, onions, potatoes. 1kg pack.',
          image: 'fresh vegetables organic',
          category: 'Fresh Produce',
          inStock: true,
          rating: 4.7,
          shopId
        },
        {
          id: '3',
          name: 'Dairy Fresh Milk',
          price: 35,
          description: 'Pure cow milk, 500ml pack. Rich in calcium and protein.',
          image: 'fresh milk bottle',
          category: 'Dairy Products',
          inStock: true,
          rating: 4.6,
          shopId
        },
        {
          id: '4',
          name: 'Whole Wheat Bread',
          price: 25,
          originalPrice: 30,
          description: 'Freshly baked whole wheat bread loaf. Perfect for breakfast.',
          image: 'wheat bread loaf',
          category: 'Bakery',
          inStock: false,
          rating: 4.3,
          discount: 17,
          shopId
        },
        {
          id: '5',
          name: 'Premium Tea Leaves',
          price: 125,
          description: 'Assam tea leaves, 250g pack. Strong and aromatic.',
          image: 'tea leaves premium',
          category: 'Beverages',
          inStock: true,
          rating: 4.8,
          shopId
        },
        {
          id: '6',
          name: 'Cooking Oil',
          price: 145,
          originalPrice: 160,
          description: 'Refined sunflower oil, 1L bottle. Heart healthy cooking oil.',
          image: 'cooking oil bottle',
          category: 'Cooking Essentials',
          inStock: true,
          rating: 4.4,
          discount: 9,
          shopId
        }
      ];
      
      await kv.set(`products:${shopId}`, products);
    }
    
    return c.json({ products });
  } catch (error) {
    console.log('Get products error:', error);
    return c.json({ error: 'Failed to get products: ' + error.message }, 500);
  }
});

// Create order
app.post('/make-server-4ca6791f/orders', async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const orderData = await c.req.json();
    const orderId = 'SL' + Date.now().toString().slice(-6);
    
    const order = {
      id: orderId,
      userId: auth.user.id,
      ...orderData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`order:${orderId}`, order);
    
    // Add to user's orders list
    const userOrdersKey = `user_orders:${auth.user.id}`;
    const userOrders = await kv.get(userOrdersKey) || [];
    userOrders.push(orderId);
    await kv.set(userOrdersKey, userOrders);
    
    return c.json({ 
      message: 'Order created successfully',
      order: {
        id: orderId,
        status: 'confirmed',
        ...orderData
      }
    });
  } catch (error) {
    console.log('Create order error:', error);
    return c.json({ error: 'Failed to create order: ' + error.message }, 500);
  }
});

// Get user orders
app.get('/make-server-4ca6791f/orders', async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const userOrdersKey = `user_orders:${auth.user.id}`;
    const orderIds = await kv.get(userOrdersKey) || [];
    
    const orders = [];
    for (const orderId of orderIds) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        orders.push(order);
      }
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ orders });
  } catch (error) {
    console.log('Get orders error:', error);
    return c.json({ error: 'Failed to get orders: ' + error.message }, 500);
  }
});

// Get specific order
app.get('/make-server-4ca6791f/orders/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`groovy_order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log('Get order error:', error);
    return c.json({ error: 'Failed to get order: ' + error.message }, 500);
  }
});

// Update order status
app.put('/make-server-4ca6791f/orders/:orderId/status', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ 
      message: 'Order status updated successfully',
      order 
    });
  } catch (error) {
    console.log('Update order status error:', error);
    return c.json({ error: 'Failed to update order status: ' + error.message }, 500);
  }
});



// Get rewards for a user
app.get('/make-server-4ca6791f/rewards/:userEmail', async (c) => {
  try {
    const userEmail = c.req.param('userEmail');
    const rewards = await kv.get(`rewards:${userEmail}`) || { totalRewards: 0, history: [] };
    
    return c.json(rewards);
  } catch (error) {
    console.log('Get rewards error:', error);
    return c.json({ error: 'Failed to get rewards: ' + error.message }, 500);
  }
});

// Add rewards
app.post('/make-server-4ca6791f/rewards/add', async (c) => {
  try {
    const { userEmail, pointsToAdd, orderAmount } = await c.req.json();
    
    const rewards = await kv.get(`rewards:${userEmail}`) || { totalRewards: 0, history: [] };
    
    rewards.totalRewards += pointsToAdd;
    rewards.history = rewards.history || [];
    rewards.history.push({
      points: pointsToAdd,
      orderAmount,
      timestamp: new Date().toISOString(),
    });
    
    await kv.set(`rewards:${userEmail}`, rewards);
    
    return c.json({ 
      message: 'Rewards added successfully',
      totalRewards: rewards.totalRewards 
    });
  } catch (error) {
    console.log('Add rewards error:', error);
    return c.json({ error: 'Failed to add rewards: ' + error.message }, 500);
  }
});

// Get user orders by email
app.get('/make-server-4ca6791f/orders/user/:userEmail', async (c) => {
  try {
    const userEmail = c.req.param('userEmail');
    const ordersList = await kv.get(`user_orders_list:${userEmail}`) || [];
    
    const orders = [];
    for (const orderId of ordersList) {
      const order = await kv.get(`groovy_order:${orderId}`);
      if (order) {
        orders.push(order);
      }
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ orders });
  } catch (error) {
    console.log('Get user orders error:', error);
    return c.json({ error: 'Failed to get orders: ' + error.message }, 500);
  }
});

// Get all orders (admin only)
app.get('/make-server-4ca6791f/orders/all', async (c) => {
  try {
    const allOrderKeys = await kv.getByPrefix('groovy_order:');
    
    // Extract values properly - getByPrefix returns an array of objects with key and value
    const orders = allOrderKeys.map(item => {
      // If item is already the order object, return it
      if (item.orderId) return item;
      // Otherwise, it's a key-value pair, return the value
      return item.value || item;
    }).filter(order => order && order.orderId);
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ orders });
  } catch (error) {
    console.log('Get all orders error:', error);
    return c.json({ error: 'Failed to get all orders: ' + error.message }, 500);
  }
});

// Create new order with rewards
app.post('/make-server-4ca6791f/orders/create', async (c) => {
  try {
    const orderData = await c.req.json();
    const orderId = 'GRV' + Date.now().toString().slice(-8);
    
    const order = {
      orderId,
      ...orderData,
      createdAt: new Date().toISOString(),
    };
    
    // Save the order
    await kv.set(`groovy_order:${orderId}`, order);
    
    // Add to user's order list
    const userOrdersList = await kv.get(`user_orders_list:${orderData.userEmail}`) || [];
    userOrdersList.push(orderId);
    await kv.set(`user_orders_list:${orderData.userEmail}`, userOrdersList);
    
    return c.json({ 
      message: 'Order created successfully',
      order 
    });
  } catch (error) {
    console.log('Create order error:', error);
    return c.json({ error: 'Failed to create order: ' + error.message }, 500);
  }
});

// Health check
app.get('/make-server-4ca6791f/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);