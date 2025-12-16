import { Button } from './ui/button';
import { UtensilsCrossed, Moon, Gamepad2, Bath } from 'lucide-react';

function ActionsPanel({ actions }) {
  const handleAction = (action) => (e) => {
    e.preventDefault();
    action();
  };

  const actionButtons = [
    { id: 'btn-feed', action: actions.feed, icon: UtensilsCrossed, label: 'Feed' },
    { id: 'btn-sleep', action: actions.sleep, icon: Moon, label: 'Sleep' },
    { id: 'btn-play', action: actions.play, icon: Gamepad2, label: 'Play' },
    { id: 'btn-clean', action: actions.clean, icon: Bath, label: 'Clean' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
      {actionButtons.map(({ id, action, icon: Icon, label }) => (
        <Button
          key={id}
          id={id}
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          onClick={handleAction(action)}
          onTouchStart={handleAction(action)}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Button>
      ))}
    </div>
  );
}

export default ActionsPanel;
