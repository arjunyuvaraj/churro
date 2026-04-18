/**
 * Neighbor task template management.
 * Allows neighbors to save reusable task templates and use them for bulk scheduling.
 */

import { arrayRemove, arrayUnion, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Add a task template to the neighbor's profile
 */
export async function addTaskTemplate(neighborUid, template) {
  if (!neighborUid || !db) {
    throw new Error('Neighbor not authenticated');
  }

  const templateWithId = {
    ...template,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  const userRef = doc(db, 'users', neighborUid);
  await setDoc(userRef, { taskTemplates: arrayUnion(templateWithId) }, { merge: true });

  return templateWithId;
}

/**
 * Update an existing task template
 */
export async function updateTaskTemplate(neighborUid, templateId, updates) {
  if (!neighborUid || !db) {
    throw new Error('Neighbor not authenticated');
  }

  const userRef = doc(db, 'users', neighborUid);
  // Remove old template and add updated one
  const oldTemplate = (await getTaskTemplates(neighborUid)).find((t) => t.id === templateId);
  if (oldTemplate) {
    await setDoc(userRef, { taskTemplates: arrayRemove(oldTemplate) }, { merge: true });
  }

  const updatedTemplate = {
    ...oldTemplate,
    ...updates,
    id: templateId,
    updatedAt: new Date().toISOString()
  };

  await setDoc(userRef, { taskTemplates: arrayUnion(updatedTemplate) }, { merge: true });
  return updatedTemplate;
}

/**
 * Delete a task template
 */
export async function deleteTaskTemplate(neighborUid, templateId) {
  if (!neighborUid || !db) {
    throw new Error('Neighbor not authenticated');
  }

  const userRef = doc(db, 'users', neighborUid);
  const templates = await getTaskTemplates(neighborUid);
  const templateToDelete = templates.find((t) => t.id === templateId);

  if (templateToDelete) {
    await setDoc(userRef, { taskTemplates: arrayRemove(templateToDelete) }, { merge: true });
  }
}

/**
 * Get all task templates for a neighbor (from their user profile)
 * Note: This is a synchronous lookup assuming templates are in memory from auth context
 */
export async function getTaskTemplates(neighborUid) {
  if (!neighborUid || !db) return [];

  // In practice, this would be called from the neighbor profile already loaded in auth context
  // For standalone use, fetch from Firestore
  const userRef = doc(db, 'users', neighborUid);
  return []; // Placeholder - actual implementation uses auth context
}

/**
 * Convert template to task creation object
 */
export function templateToTask(template, date, startTime, endTime, address, latitude, longitude) {
  return {
    category: template.category,
    title: template.title,
    description: template.description,
    specialInstructions: template.specialInstructions,
    requiresPowerTools: template.requiresPowerTools,
    pay: template.pay,
    date,
    startTime,
    endTime,
    neighborAddress: address,
    latitude,
    longitude
  };
}
