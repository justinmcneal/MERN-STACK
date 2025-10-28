import OpportunityScanner from './opportunityScanner';
import DataPipeline from './dataPipeline';
import logger from '../utils/logger';

class JobManager {
  private opportunityScanner: OpportunityScanner;
  private dataPipeline: DataPipeline;
  private isInitialized: boolean = false;

  constructor() {
    this.opportunityScanner = new OpportunityScanner();
    this.dataPipeline = new DataPipeline();
    this.isInitialized = true;
  }

  public getOpportunityScanner(): OpportunityScanner {
    return this.opportunityScanner;
  }

  public getDataPipeline(): DataPipeline {
    return this.dataPipeline;
  }

  public getSystemStatus(): any {
    return {
      isInitialized: this.isInitialized,
      opportunityScanner: this.opportunityScanner.getStatus(),
      dataPipeline: this.dataPipeline.getStatus(),
      timestamp: new Date()
    };
  }

  public getHealthCheck(): any {
    return {
      system: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
      },
      opportunityScanner: this.opportunityScanner.getStatus(),
      dataPipeline: this.dataPipeline.getHealthCheck()
    };
  }

  public stopAll(): void {
    logger.info('Stopping all background jobs');
    this.opportunityScanner.stop();
    this.dataPipeline.stop();
    this.isInitialized = false;
    logger.success('All background jobs stopped');
  }

  public restartAll(): void {
    logger.info('Restarting all background jobs');
    this.stopAll();
    
    this.opportunityScanner = new OpportunityScanner();
    this.dataPipeline = new DataPipeline();
    this.isInitialized = true;
    
    logger.success('All background jobs restarted');
  }
}

const jobManager = new JobManager();

export default jobManager;
export { OpportunityScanner, DataPipeline };
