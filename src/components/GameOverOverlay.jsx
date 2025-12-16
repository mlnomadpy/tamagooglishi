import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';

function GameOverOverlay({ onRestart }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-80 text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">
            💀 Game Over
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your pet has passed away. Take better care next time!
          </p>
          <Button 
            onClick={onRestart}
            className="w-full gap-2"
            size="lg"
          >
            <RotateCcw className="h-5 w-5" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default GameOverOverlay;
