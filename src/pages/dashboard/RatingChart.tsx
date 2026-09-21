import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface RatingChartProps {
  data: ChartData[];
}

const RatingChart: React.FC<RatingChartProps> = ({ data }) => {
  // Get player names from the data (excluding the 'name' property)
  const playerNames = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'name')
    : [];

  // Enhanced color palette for up to 12 players with distinct, visually pleasing colors
  const colors = [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#F44336', // Red
    '#FFC107', // Amber
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#E91E63', // Pink
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#009688', // Teal
  ];

  // Calculate appropriate domain min and max with some padding
  const allRatings = data.flatMap(entry => 
    playerNames.map(player => Number(entry[player]))
  ).filter(rating => !isNaN(rating));
  
  const minRating = Math.min(...allRatings);
  const maxRating = Math.max(...allRatings);
  
  // Add dynamic padding based on rating range
  const ratingRange = maxRating - minRating;
  const padding = Math.max(50, ratingRange * 0.1);
  const yDomainMin = Math.max(0, minRating - padding);
  const yDomainMax = maxRating + padding;

  // Calculate average rating line
  const averageRating = Math.round(
    allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
  );

  // Custom tooltip to show more information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-lg border border-border">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
              <span>{Math.round(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#666' }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            domain={[yDomainMin, yDomainMax]}
            tick={{ fill: '#666' }}
            tickLine={{ stroke: '#666' }}
            label={{ 
              value: 'Rating', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#666' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
          <ReferenceLine 
            y={averageRating} 
            stroke="#666" 
            strokeDasharray="3 3"
            label={{ 
              value: `Avg: ${averageRating}`,
              position: 'right',
              fill: '#666',
              fontSize: 12
            }}
          />
          {playerNames.map((player, index) => (
            <Line
              key={player}
              type="monotone"
              dataKey={player}
              name={player}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;
