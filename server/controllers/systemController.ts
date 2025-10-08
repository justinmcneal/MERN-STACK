import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jobManager from '../jobs';

// GET /api/system/status - Get overall system status
export const getSystemStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = jobManager.getSystemStatus();
  res.status(200).json({ success: true, data: status });
});

// GET /api/system/health - Get health check for all services
export const getHealthCheck = asyncHandler(async (req: Request, res: Response) => {
  const health = jobManager.getHealthCheck();
  res.status(200).json({ success: true, data: health });
});

// POST /api/system/scan - Manually trigger opportunity scan
export const triggerOpportunityScan = asyncHandler(async (req: Request, res: Response) => {
  const scanner = jobManager.getOpportunityScanner();
  const result = await scanner.scanAllOpportunities();
  
  res.status(200).json({ 
    success: true, 
    message: 'Opportunity scan triggered',
    data: result 
  });
});

// POST /api/system/update-data - Manually trigger data update
export const triggerDataUpdate = asyncHandler(async (req: Request, res: Response) => {
  const pipeline = jobManager.getDataPipeline();
  await pipeline.forceUpdateAll();
  
  res.status(200).json({ 
    success: true, 
    message: 'Data update triggered' 
  });
});

// POST /api/system/restart-jobs - Restart all background jobs
export const restartBackgroundJobs = asyncHandler(async (req: Request, res: Response) => {
  jobManager.restartAll();
  
  res.status(200).json({ 
    success: true, 
    message: 'Background jobs restarted' 
  });
});

// GET /api/system/scanner-status - Get opportunity scanner status
export const getScannerStatus = asyncHandler(async (req: Request, res: Response) => {
  const scanner = jobManager.getOpportunityScanner();
  const status = scanner.getStatus();
  
  res.status(200).json({ success: true, data: status });
});

// GET /api/system/pipeline-status - Get data pipeline status
export const getPipelineStatus = asyncHandler(async (req: Request, res: Response) => {
  const pipeline = jobManager.getDataPipeline();
  const status = pipeline.getStatus();
  
  res.status(200).json({ success: true, data: status });
});
