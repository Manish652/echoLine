import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createGroup,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  deleteGroup,
  updateGroupSettings
} from '../controllers/group.controller.js';

const router = express.Router();

// All group routes require authentication
router.use(protectRoute);

// Group management
router.post('/create', createGroup);
router.get('/my-groups', getUserGroups);
router.get('/:groupId/messages', getGroupMessages);
router.post('/:groupId/send-message', sendGroupMessage);
router.put('/:groupId/settings', updateGroupSettings);

// Member management
router.post('/:groupId/add-members', addGroupMember);
router.delete('/:groupId/members/:userId', removeGroupMember);
router.post('/:groupId/leave', leaveGroup);

// Group deletion
router.delete('/:groupId', deleteGroup);

export default router;
