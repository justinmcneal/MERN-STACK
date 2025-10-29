/**
 * Export utility for downloading arbitrage opportunity data as CSV
 */

// Static CSV data matching the ArbitragePro_Raw_Data.csv structure
const ARBITRAGE_DATA_CSV = `Timestamp,Blockchain,Token,Token_Price_USD,Manual_Profit_USD,Automated_Profit_USD,Gas_Fee_USD,Profit_After_Fee_USD,Profit_to_Gas_Ratio,Opportunity_Score,Liquidity_USD,Arbitrage_Spread_%,Monitoring_Type,ROI_%,Opportunity_Type,Data_Source,Notes
2025-01-01 00:00:00,Ethereum,XRP,1123.93,143.1,181.04,13.53,129.57,9.58,49.36,12421185.22,1.45,Manual,11.53,Same-Chain,CoinMarketCap,Fast execution
2025-01-01 00:00:00,Ethereum,XRP,62.24,145.79,188.25,4.9,183.35,37.42,50.91,9206955.35,0.65,Automated,294.59,Cross-Chain,CoinGecko,"Low gas, stable profit"
2025-01-02 00:00:00,Ethereum,XRP,1835.75,29.53,47.68,8.34,21.19,2.54,67.36,12255876.81,0.19,Manual,1.15,Cross-Chain,Chainlink,High volatility observed
2025-01-02 00:00:00,Ethereum,XRP,1822.83,33.87,41.8,21.36,20.44,0.96,97.94,14000427.5,0.94,Automated,1.12,Cross-Chain,CoinGecko,"High gas, moderate spread"
2025-01-03 00:00:00,Ethereum,XRP,366.55,79.32,85.87,20.47,58.85,2.87,55.53,11387495.31,0.45,Manual,16.06,Same-Chain,CoinMarketCap,Low liquidity risk
2025-01-03 00:00:00,Ethereum,XRP,2908.77,118.52,165.8,20.15,145.65,7.23,75.87,1859318.49,0.72,Automated,5.01,Cross-Chain,CoinGecko,Fast execution
2025-01-04 00:00:00,Ethereum,XRP,1166.34,47.99,90.28,8.12,39.87,4.91,56.86,2416462.23,1.98,Manual,3.42,Cross-Chain,CoinMarketCap,Fast execution
2025-01-04 00:00:00,Ethereum,XRP,2316.85,37.82,43.07,18.38,24.69,1.34,82.41,7810848.84,0.32,Automated,1.07,Cross-Chain,CoinGecko,Low liquidity risk
2025-01-05 00:00:00,Ethereum,XRP,2589.38,97.26,117.15,1.57,95.69,60.95,58.66,17857042.11,1,Manual,3.7,Cross-Chain,CoinGecko,Fast execution
2025-01-05 00:00:00,Ethereum,XRP,359.22,109.85,149.09,12.69,136.4,10.75,86.26,1482963.41,0.3,Automated,37.97,Same-Chain,Chainlink,"Low gas, stable profit"
2025-01-06 00:00:00,Ethereum,XRP,94.77,99.1,118.25,11.52,87.58,7.6,94.45,5347165.14,0.25,Manual,92.41,Cross-Chain,Chainlink,High volatility observed
2025-01-06 00:00:00,Ethereum,XRP,869.61,32.57,79.41,18.21,61.2,3.36,78,17958620.97,1.12,Automated,7.04,Same-Chain,CoinGecko,Low liquidity risk
2025-01-07 00:00:00,Ethereum,XRP,2422.42,135.45,154.76,2.61,132.84,50.9,53.68,1132090.48,1.07,Manual,5.48,Cross-Chain,Chainlink,High volatility observed
2025-01-07 00:00:00,Ethereum,XRP,1252.52,41.1,51.49,7.7,43.79,5.69,96.57,7908962.45,1.95,Automated,3.5,Cross-Chain,Chainlink,High volatility observed
2025-01-08 00:00:00,Ethereum,XRP,2887.36,45.25,72.63,6.87,38.38,5.59,57.09,1978096.27,0.63,Manual,1.33,Cross-Chain,Chainlink,"Low gas, stable profit"
2025-01-08 00:00:00,Ethereum,XRP,2724.84,43.54,55.06,11.09,43.97,3.96,99.14,5515113.34,1.48,Automated,1.61,Same-Chain,Chainlink,Fast execution
2025-01-09 00:00:00,Ethereum,XRP,1103.67,98.52,132.03,12.12,86.4,7.13,45.42,1774727.69,1.22,Manual,7.83,Cross-Chain,CoinGecko,"High gas, moderate spread"
2025-01-09 00:00:00,Ethereum,XRP,2032.85,12.32,40.36,5.21,35.15,6.75,78.71,18797869.79,0.36,Automated,1.73,Same-Chain,Chainlink,Fast execution
2025-01-10 00:00:00,Ethereum,XRP,1023.53,25.89,72.5,19.76,6.13,0.31,55.48,11063360.99,0.56,Manual,0.6,Cross-Chain,CoinMarketCap,Fast execution
2025-01-10 00:00:00,Ethereum,XRP,279.76,135.61,181.13,14.3,166.83,11.67,60.34,17854642.06,1.58,Automated,59.63,Same-Chain,Chainlink,High volatility observed
2025-01-01 00:00:00,Ethereum,SOL,1926.27,21.78,34.05,20.23,1.55,0.08,76.39,1096170.09,0.41,Manual,0.08,Same-Chain,Chainlink,Fast execution
2025-01-01 00:00:00,Ethereum,SOL,1646.43,106.87,141.21,5.16,136.05,26.37,82.73,13343025.08,1.71,Automated,8.26,Cross-Chain,Chainlink,Fast execution
2025-01-02 00:00:00,Ethereum,SOL,1973.01,89.56,98.78,8.37,81.19,9.7,55.91,17948884.55,1.3,Manual,4.12,Same-Chain,Chainlink,"Low gas, stable profit"
2025-01-02 00:00:00,Ethereum,SOL,2384.54,80.37,111.33,11.16,100.17,8.98,51.71,13263973.62,0.44,Automated,4.2,Cross-Chain,Chainlink,"High gas, moderate spread"
2025-01-03 00:00:00,Ethereum,SOL,2821.41,143.55,189.72,8.42,135.13,16.05,40.93,19308779.56,1.72,Manual,4.79,Same-Chain,CoinGecko,Fast execution
2025-01-03 00:00:00,Ethereum,SOL,883.7,63.91,107.21,7.23,99.98,13.83,50.17,11831162.23,0.28,Automated,11.31,Cross-Chain,Chainlink,"Low gas, stable profit"
2025-01-04 00:00:00,Ethereum,SOL,1845.21,148.61,159.91,11.73,136.88,11.67,92.64,7830331.87,0.66,Manual,7.42,Same-Chain,CoinMarketCap,"Low gas, stable profit"
2025-01-04 00:00:00,Ethereum,SOL,2428.18,123.42,167.44,20.56,146.88,7.14,70.68,14337370.67,1.61,Automated,6.05,Same-Chain,Chainlink,Fast execution
2025-01-05 00:00:00,Ethereum,SOL,2670.07,57.32,79.22,2.25,55.07,24.48,74.7,6444283.79,1.22,Manual,2.06,Same-Chain,Chainlink,"High gas, moderate spread"
2025-01-05 00:00:00,Ethereum,SOL,91.99,15.23,57.25,8.2,49.05,5.98,47.62,12834919.04,0.26,Automated,53.32,Cross-Chain,CoinGecko,Low liquidity risk
2025-01-06 00:00:00,Ethereum,SOL,155.52,84.39,113.72,14.4,69.99,4.86,83.57,16108537.7,0.61,Manual,45,Same-Chain,CoinGecko,"High gas, moderate spread"
2025-01-06 00:00:00,Ethereum,SOL,1317.19,20.98,27.12,21.67,5.45,0.25,90.16,3972303.81,0.58,Automated,0.41,Same-Chain,CoinMarketCap,"Low gas, stable profit"
2025-01-07 00:00:00,Ethereum,SOL,1647.91,110.04,144.75,6.41,103.63,16.17,97.29,8972401.19,0.57,Manual,6.29,Same-Chain,Chainlink,Fast execution
2025-01-07 00:00:00,Ethereum,SOL,1068.24,116.1,121.75,2.74,119.01,43.43,42.76,10009302.75,0.29,Automated,11.14,Same-Chain,CoinGecko,Fast execution
2025-01-08 00:00:00,Ethereum,SOL,1475.1,76.29,89.08,9.85,66.44,6.75,63.91,8117639.68,1.29,Manual,4.5,Cross-Chain,CoinMarketCap,High volatility observed
2025-01-08 00:00:00,Ethereum,SOL,1509.66,129.91,164.55,3.79,160.76,42.42,44.23,18864374.59,1.19,Automated,10.65,Same-Chain,CoinMarketCap,"High gas, moderate spread"
2025-01-09 00:00:00,Ethereum,SOL,1164.82,100.06,125.68,12.34,87.72,7.11,96.49,4720031.56,0.23,Manual,7.53,Cross-Chain,CoinGecko,High volatility observed
2025-01-09 00:00:00,Ethereum,SOL,302.78,12.55,21.8,15.42,6.38,0.41,44.27,16474901.17,0.64,Automated,2.11,Same-Chain,CoinMarketCap,Fast execution
2025-01-10 00:00:00,Ethereum,SOL,354.94,107.54,140.84,19.76,87.78,4.44,84.1,15261680.28,1.63,Manual,24.73,Cross-Chain,Chainlink,"Low gas, stable profit"
2025-01-10 00:00:00,Ethereum,SOL,2971.52,67.77,89.51,17.5,72.01,4.11,60.45,15266550.29,1.53,Automated,2.42,Same-Chain,CoinGecko,"Low gas, stable profit"
2025-01-01 00:00:00,Ethereum,MATIC,309.82,136.36,164.1,18.62,117.74,6.32,59.2,18202257.55,0.27,Manual,38,Cross-Chain,CoinMarketCap,Fast execution
2025-01-01 00:00:00,Ethereum,MATIC,958.28,143.01,190.79,12.97,177.82,13.71,77.91,13777850.67,1.53,Automated,18.56,Cross-Chain,Chainlink,"Low gas, stable profit"
2025-01-02 00:00:00,Ethereum,MATIC,2374.84,120.55,129.65,11.2,109.35,9.76,43.45,7667385.24,0.32,Manual,4.6,Cross-Chain,CoinMarketCap,"Low gas, stable profit"
2025-01-02 00:00:00,Ethereum,MATIC,429.4,116.61,149.43,2.41,147.02,61,45.05,14418602.32,0.25,Automated,34.24,Cross-Chain,CoinGecko,Fast execution
2025-01-03 00:00:00,Ethereum,MATIC,254.97,148.13,169.97,8.43,139.7,16.57,88.77,8148932.13,0.26,Manual,54.79,Same-Chain,CoinGecko,High volatility observed
2025-01-03 00:00:00,Ethereum,MATIC,2331.55,88.18,112.27,20.41,91.86,4.5,46.67,2069762.24,0.33,Automated,3.94,Same-Chain,CoinMarketCap,High volatility observed
2025-01-04 00:00:00,Ethereum,MATIC,353.02,100.89,139.46,13.19,87.7,6.65,97.73,5248320.93,1.93,Manual,24.84,Same-Chain,Chainlink,"High gas, moderate spread"
2025-01-04 00:00:00,Ethereum,MATIC,36.96,145.78,152.72,20.07,132.65,6.61,71.66,19416748.18,1.09,Automated,358.9,Cross-Chain,Chainlink,"Low gas, stable profit"
2025-01-05 00:00:00,Ethereum,MATIC,1888.38,107.4,132.85,14.18,93.22,6.57,75.06,19057818.2,1.79,Manual,4.94,Same-Chain,Chainlink,High volatility observed
2025-01-05 00:00:00,Ethereum,MATIC,2518.52,42.24,59.19,6.26,52.93,8.46,78.09,10988645.77,0.48,Automated,2.1,Cross-Chain,Chainlink,Low liquidity risk
2025-01-06 00:00:00,Ethereum,MATIC,2838.15,60.67,77.72,6.47,71.25,11.01,49.55,14869993.67,1.8,Manual,2.51,Same-Chain,Chainlink,High volatility observed
2025-01-06 00:00:00,Ethereum,MATIC,1513.24,109.15,126.41,9.6,116.81,12.17,56.12,3663799.35,0.96,Automated,7.72,Same-Chain,CoinGecko,High volatility observed
2025-01-07 00:00:00,Ethereum,MATIC,1063.28,131.77,176.17,9.39,166.78,17.76,47.07,18950027.94,0.71,Manual,15.69,Same-Chain,CoinMarketCap,Fast execution
2025-01-07 00:00:00,Ethereum,MATIC,2063.24,34.36,75.66,6.64,69.02,10.39,83.06,18815924.46,0.98,Automated,3.35,Cross-Chain,Chainlink,"Low gas, stable profit"
2025-01-08 00:00:00,Ethereum,MATIC,1287.01,64.06,103.89,13.2,50.86,3.85,93.56,8829831.91,1.82,Manual,3.95,Cross-Chain,Chainlink,Fast execution
2025-01-08 00:00:00,Ethereum,MATIC,2064.57,106.87,133.52,19.07,114.45,6,98.68,3950890.26,1.18,Automated,5.54,Same-Chain,CoinGecko,"Low gas, stable profit"
2025-01-09 00:00:00,Ethereum,MATIC,2975.93,99.59,138.96,8.99,90.6,10.08,52.78,5098993.56,0.53,Manual,3.04,Same-Chain,CoinGecko,"High gas, moderate spread"
2025-01-09 00:00:00,Ethereum,MATIC,1598.6,134.12,147.96,18.02,129.94,7.21,69.53,19133999.86,0.25,Automated,8.13,Cross-Chain,Chainlink,"High gas, moderate spread"
2025-01-10 00:00:00,Ethereum,MATIC,2863.37,48.89,93.37,19.12,29.77,1.56,93.9,6327084.64,1.9,Manual,1.04,Cross-Chain,CoinGecko,Fast execution
2025-01-10 00:00:00,Ethereum,MATIC,2829.18,112.93,146.25,12.43,133.82,10.76,87.47,17054732.35,1.22,Automated,4.73,Cross-Chain,CoinGecko,"High gas, moderate spread"`;

/**
 * Downloads the arbitrage data as a CSV file
 * @param filename - Optional custom filename (defaults to ArbitragePro_Raw_Data.csv)
 */
export const downloadArbitrageDataCSV = (filename: string = 'ArbitragePro_Raw_Data.csv'): void => {
  try {
    // Create a Blob from the CSV string
    const blob = new Blob([ARBITRAGE_DATA_CSV], { type: 'text/csv;charset=utf-8;' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Append to body, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup the temporary URL
    URL.revokeObjectURL(url);
    
    console.log(`✅ Successfully exported ${filename}`);
  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Alternative export with custom date range
 * @param filename - Custom filename
 */
export const exportDataWithTimestamp = (): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ArbitragePro_Export_${timestamp}.csv`;
  downloadArbitrageDataCSV(filename);
};
