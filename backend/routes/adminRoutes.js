import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';

// 导入管理员控制器
import {
  getOrganizations,
  getOrganizationTree,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from '../controllers/admin/organizationController.js';

import {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
} from '../controllers/admin/positionController.js';

import {
  getArchives,
  getArchiveById,
  createArchive,
  reviewArchive,
  updateArchive,
  deleteArchive
} from '../controllers/admin/archiveController.js';

import {
  getSalaryItems,
  getSalaryItemById,
  createSalaryItem,
  updateSalaryItem,
  deleteSalaryItem
} from '../controllers/admin/salaryItemController.js';

const router = express.Router();

// 所有管理员路由都需要登录和管理员权限
router.use(protect);
router.use(isAdmin);

// 机构管理路由
router.route('/organizations')
  .get(getOrganizations)
  .post(createOrganization);

router.get('/organizations/tree', getOrganizationTree);

router.route('/organizations/:id')
  .get(getOrganizationById)
  .put(updateOrganization)
  .delete(deleteOrganization);

// 职位管理路由
router.route('/positions')
  .get(getPositions)
  .post(createPosition);

router.route('/positions/:id')
  .get(getPositionById)
  .put(updatePosition)
  .delete(deletePosition);

// 档案管理路由
router.route('/archives')
  .get(getArchives)
  .post(createArchive);

router.route('/archives/:id')
  .get(getArchiveById)
  .put(updateArchive)
  .delete(deleteArchive);

router.put('/archives/:id/review', reviewArchive);

// 薪酬项目管理路由
router.route('/salary-items')
  .get(getSalaryItems)
  .post(createSalaryItem);

router.route('/salary-items/:id')
  .get(getSalaryItemById)
  .put(updateSalaryItem)
  .delete(deleteSalaryItem);

export default router;

