import OpportunityScanner from './opportunityScanner';
import DataPipeline from './dataPipeline';

class JobManager {
  private opportunityScanner: OpportunityScanner;
  private dataPipeline: DataPipeline;
  private isInitialized: boolean = false;

  constructor() {
    this.opportunityScanner = new OpportunityScanner();
    this.dataPipeline = new DataPipeline();
    this.isInitialized = true;
  }

  /**
   * Get opportunity scanner instance
   */
  public getOpportunityScanner(): OpportunityScanner {
    return this.opportunityScanner;
  }

  /**
   * Get data pipeline instance
   */
  public getDataPipeline(): DataPipeline {
    return this.dataPipeline;
  }

  /**
   * Get overall system status
   */
  public getSystemStatus(): any {
    return {
      isInitialized: this.isInitialized,
      opportunityScanner: this.opportunityScanner.getStatus(),
      dataPipeline: this.dataPipeline.getStatus(),
      timestamp: new Date()
    };
  }

  /**
   * Get health check for all services
   */
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

  /**
   * Stop all background jobs
   */
  public stopAll(): void {
    console.log('🛑 Stopping all background jobs...');
    this.opportunityScanner.stop();
    this.dataPipeline.stop();
    this.isInitialized = false;
    console.log('✅ All background jobs stopped');
  }

  /**
   * Restart all background jobs
   */
  public restartAll(): void {
    console.log('🔄 Restarting all background jobs...');
    this.stopAll();
    
    // Reinitialize
    this.opportunityScanner = new OpportunityScanner();
    this.dataPipeline = new DataPipeline();
    this.isInitialized = true;
    
    console.log('✅ All background jobs restarted');
  }
}

// Create singleton instance
const jobManager = new JobManager();

export default jobManager;
export { OpportunityScanner, DataPipeline };
