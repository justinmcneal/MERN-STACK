import React from 'react';
import Card from '../../../ui/Card/Card';

export interface PriceData {
  token: string;
  chain: string;
  currentPrice: string;
  lastUpdated: string;
}

interface PriceDataTableProps {
  data: PriceData[];
  title?: string;
  className?: string;
}

const PriceDataTable: React.FC<PriceDataTableProps> = ({
  data,
  title = "Live Token Prices",
  className = ""
}) => {
  return (
    <Card className={`${className}`}>
      <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Token</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Chain</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Current Price</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index} 
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">{item.token}</td>
                <td className="py-3 px-4 text-slate-300">{item.chain}</td>
                <td className="py-3 px-4 text-cyan-400 font-medium">{item.currentPrice}</td>
                <td className="py-3 px-4 text-slate-400 text-sm">{item.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PriceDataTable;
