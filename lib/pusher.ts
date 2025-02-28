import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Validate required environment variables
const requiredEnvVars = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(`Missing Pusher environment variables: ${missingVars.join(', ')}`);
}

// Server-side Pusher instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance
const clientKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const clientCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!clientKey || !clientCluster) {
  console.warn('Missing client-side Pusher configuration');
}

export const pusherClient = new PusherClient(
  clientKey!,
  {
    cluster: clientCluster!,
  }
); 