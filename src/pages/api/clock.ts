
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
let clients: NextApiResponse[] = [];

// This is the primary handler for the /api/clock endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { uid, action } = req.body as { uid: string; action: 'in' | 'out' };

      // Basic validation
      if (!uid || !action || !['in', 'out'].includes(action)) {
        return res.status(400).json({ error: 'Invalid input: uid and action are required.' });
      }

      const tagSnap = await db.collection('rfidTags').doc(uid).get();

      if (!tagSnap.exists) {
        return res.status(400).json({ error: 'Unknown tag' });
      }

      const { employeeId, name } = tagSnap.data()!;

      // Create a new time entry in Firestore
      await db.collection('timeEntries').add({
        employeeId,
        name,
        action,
        method: 'RFID',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Prepare payload to broadcast to listening clients
      const payload = JSON.stringify({ employeeId, name, action });

      // Send the event to all connected clients
      clients.forEach(client => client.write(`data: ${payload}\n\n`));

      return res.status(200).json({ success: true, name });
    } catch (error) {
      console.error('Error processing clock event:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  // Handle other methods
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

// This function is exported to be used by the /api/events endpoint
export function eventsHandler(req: NextApiRequest, res: NextApiResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');

  // Add the new client to our list
  clients.push(res);

  // When the client closes the connection, remove them from the list
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
}
