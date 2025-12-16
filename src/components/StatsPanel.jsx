import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Heart, Zap, Smile, Sparkles } from 'lucide-react';

function StatsPanel({ stats, stage, age }) {
  const statItems = [
    { 
      name: 'Hunger', 
      value: stats.hunger, 
      icon: Heart, 
      color: 'bg-hunger',
      description: 'Feed your pet to reduce hunger'
    },
    { 
      name: 'Energy', 
      value: stats.energy, 
      icon: Zap, 
      color: 'bg-energy',
      description: 'Let your pet sleep to restore energy'
    },
    { 
      name: 'Happiness', 
      value: stats.happiness, 
      icon: Smile, 
      color: 'bg-happiness',
      description: 'Play with your pet to increase happiness'
    },
    { 
      name: 'Hygiene', 
      value: stats.hygiene, 
      icon: Sparkles, 
      color: 'bg-hygiene',
      description: 'Clean to improve hygiene'
    },
  ];

  return (
    <Card className="absolute top-4 left-4 w-64 backdrop-blur-sm bg-card/95">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>🥚 Pet Stats</span>
          <span className="text-xs font-normal text-muted-foreground">
            {stage} • {age}m
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {stat.name}
                </span>
                <span className="font-medium">{stat.value}%</span>
              </div>
              <Progress 
                value={stat.value} 
                indicatorClassName={stat.color}
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default StatsPanel;
