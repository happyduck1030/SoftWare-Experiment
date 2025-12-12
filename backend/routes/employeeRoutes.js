import express from 'express';
import {
  getMyArchive,
  updateMyArchive,
  getMySalary,
  getOrganizationInfo,
  getSubordinates,
  getSubordinateDetail,
  updateSubordinate,
  getSubordinateSalary
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要登录
router.use(protect);

// 员工自助功能
router.get('/archive', getMyArchive);
router.put('/archive', updateMyArchive);
router.get('/salary', getMySalary);
router.get('/organization', getOrganizationInfo);

// 下属管理（机构负责人功能）
router.get('/subordinates', getSubordinates);
router.get('/subordinates/:id', getSubordinateDetail);
router.put('/subordinates/:id', updateSubordinate);
router.get('/subordinates/:id/salary', getSubordinateSalary);

export default router;

