import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const snap = await db
    .collection('timeEntries')
    .orderBy('timestamp','desc')
    .limit(1)
    .get();
  if (snap.empty) return res.status(204).end();
  const entry = snap.docs[0].data();
  const empSnap = await db.collection('employees').doc(entry.employeeId).get();
  const name = empSnap.exists ? empSnap.data()!.name : 'Unknown';
  res.status(200).json({ name, action: entry.action });
}